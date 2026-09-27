# Goods Flow Solver — Notes

This folder is meant to hold a generic goods flow solver, implementing the "Goods Flow Solver"
section of [railway-empire-spec.md](../../../railway-empire-spec.md). Nothing is implemented yet;
this document captures the design intent and the open gaps to resolve before (and while) building
it.

## Goal

One generic, pure function over the game state — something like `solveGoodsFlow(gameState)` —
that computes the network's goods flow once, and is then reused by several views:

1. Transport volumes on warehouse, station and train line detail pages (per-leg and per-node
   per-good flow, matching the spec's "derived output" almost directly).
2. Later: sum inflow/outflow on rural businesses and city industries.
3. Eventually: sum inflow/outflow on cities themselves.

(1) is a fairly direct read-out of the solver's per-leg/per-node result. (2) and (3) need more:
rural businesses, industries and cities are not graph nodes themselves (stations and warehouses
are), so their inflow/outflow has to be attributed back from whichever station/warehouse hosts
them — see the gaps below.

## What the domain model already provides

No changes needed here — the existing types in
[../game-state/types.ts](../game-state/types.ts) already carry everything the spec's algorithm
needs:

- `TrainLine`: `stops`, `trains`, `tourDays`, `cargo` — enough to build arcs and per-leg capacity
  (`trains × 8 × 7 / tourDays`), and to drop lines with unknown `tourDays` or `cargo` set to
  `'mail and passengers'`.
- `TrainStation` / `Warehouse`: `host: StopHost` (a city, or one/two rural businesses), track-based
  capacity limits, and (for warehouses) the `goods` stocking restriction.
- `City` + `Demand`: population-driven sink per good.
- `Industry` + `IndustryType`: per-level recipe (raw materials in, products out).
- `RuralBusiness` + `RuralBusinessType`: per-level production table.

## Gaps found while reviewing the spec against the code

- **Warehouse `host` does feed the balance, but only for goods in its stocking list.** A
  warehouse can load a train from two sources: its own internal stock, and the stock of whatever
  it hosts (connected rural businesses, or a city's population and industries) — but only for
  goods that are in that warehouse's configured turn-over set (the `goods` field, capped at 3 or 6
  slots by track count). The gating applies uniformly to anything passing through the warehouse:
  if a good isn't in its `goods` list, it doesn't affect the balance at all, whether the good would
  otherwise be a business's production, an industry's input/output, or a city's population demand.
  E.g. a 2-track warehouse configured for Wheat/Corn/Coal, connected to both a logging camp and a
  wheat farm, exposes the wheat farm's production (even with an empty internal wheat stock) but
  completely ignores the logging camp's wood, since wood isn't in its goods list; likewise a
  hosted city's demand for Beer is invisible to that warehouse if Beer isn't in the list. So
  `Warehouse.host` is a real source/sink like a station's, just pre-filtered by `Warehouse.goods`
  before anything else reaches the network. Still open: reconciling this with the spec's "pure
  transshipment, zero balance" phrasing — likely "zero balance" refers only to the warehouse's own
  internal stock net over time, not to whether it can access a hosted producer/consumer.
- **A city or rural business can be hosted by more than one station.** Nothing in the types or
  state providers (`train-stations-state.tsx`, `warehouses-state.tsx`) stops two different
  `TrainStation`s from listing the same city, or the same rural business, as `host`. The solver's
  per-node model implicitly assumes a city's/business's whole demand or production lives at
  exactly one node.
- **Sub-node attribution is needed for the later inflow/outflow views.** To show "how much of this
  station's demand for a good is population vs. this specific industry", or "business A vs.
  business B" when two businesses share a stop, the solver needs to keep tagged per-consumer /
  per-producer contributions, not just a per-node/per-good scalar, plus an explicit (currently
  unspecified) fairness rule for splitting a shared fulfillment fraction across them.
- **Industry conversion is a nested fixed point.** An industry's output depends on how much raw
  material the network actually delivers, which itself depends on the flow being solved. The
  existing global `produce()` pooling logic in
  [../pages/supply-demand.ts](../pages/supply-demand.ts) assumes an unconstrained global pool and
  can't be reused as-is; it needs to be recomputed per node inside the damped iteration instead.
- **Unknown production/recipe coefficients read as zero.** Levels not yet discovered
  (`productionByLevel`/`amountByLevel` entries left `undefined`) will contribute 0 supply/demand,
  which is a reasonable lower bound but should eventually be distinguished from "known zero" in
  the UI.

## Gaps to resolve, step by step

- [x] Confirm whether warehouse `host` contributes to source/sink balance: yes, gated by the
      warehouse's `goods` list — a hosted business/industry's good is only reachable through the
      warehouse if it's in that list, regardless of the warehouse's own internal stock level.
- [x] Confirm whether a hosted city's population demand is gated the same way: yes — the `goods`
      list gates anything passing through the warehouse uniformly (production, industry
      input/output, and population demand alike), with no special case for population.
- [ ] Decide how to handle a city or rural business hosted by more than one station: forbid it
      (validation), or define an explicit aggregation/split rule.
- [ ] Decide the solver's result shape for sub-node attribution (tagged per-consumer/per-producer
      contributions) and the fairness rule used to split a node's fulfillment fraction across them.
- [ ] Design how industry conversion (input-dependent output) fits into the damped iteration loop.
- [ ] Decide how to surface "unknown" (undiscovered) production/recipe coefficients versus known
      zero in solver output and UI.
