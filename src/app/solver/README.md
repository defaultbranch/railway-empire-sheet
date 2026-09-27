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
  before anything else reaches the network. Settled: "no demand or supply of their own" is about
  the warehouse itself — its internal stock nets to zero over time — and says nothing about its
  host, which it exposes exactly as a station does, minus the gated goods. The spec's "Goods Flow
  Solver" section has been amended accordingly.
- **A city or rural business can be hosted by more than one station or warehouse — this is
  allowed, not a conflict.** Nothing in the types or state providers (`train-stations-state.tsx`,
  `warehouses-state.tsx`) stops two different stops from listing the same city or rural business
  as `host`, and that's intentional: the same "greedy train" proportional split the spec already
  uses to divide a source across one node's outgoing legs generalizes to dividing a
  producer's/consumer's total across *every* connecting station/warehouse and line able to carry
  that specific good, in proportion to each connection's weekly capacity rationed to that good
  (see the split-weight decision below). There's no separate aggregation formula needed — a
  producer/consumer hosted at several stops is just a source/sink reachable via more legs. One
  nuance this surfaces: a train's realized weekly volume of a *specific* good is part of the
  solver's solution, not `trains × 8` — a leg's capacity (`trains × 8 × 7 / tourDays`) is shared
  across all goods it carries, so it has to be retained per (leg, good) in the result, not just as
  a per-leg total. That realized volume is an output, though, not the weight the split uses.
- **Sub-node attribution: producers and consumers are greedy too, same as trains.** When several
  producers (e.g. two rural businesses) or consumers (e.g. population and an industry's
  raw-material need) share a node's pooled supply/demand for a good, the node's actual
  shipped-out or fulfilled amount for that good is split back to each contributor in proportion to
  its own weekly production/consumption volume — no priority order (e.g. population before
  industry). This is the same proportional-by-own-volume rule used for splitting a source across
  legs and across multiple hosting stops, just applied one level down, to the individual
  contributors that make up a node's pooled total. So the solver needs to retain tagged
  per-producer/per-consumer contributions (not just a per-node/per-good scalar) so this split can
  be computed and read back out per rural business/industry/city later.
- **Industry conversion is a nested fixed point, but a well-behaved one.** An industry's output
  depends on how much raw material the network actually delivers, which itself depends on the flow
  being solved. It is still a simple, monotonic function of delivered input, safe to recompute
  every round of the damped iteration:
  `multiplier = clamp01(min over raw materials of delivered[good] / requiredAtLevel[good])`, then
  `output[product] = capacityAtLevel[product] × multiplier`, consuming `requiredAtLevel[good] ×
  multiplier` of each raw material. Ratio and cap both hold at once, and both come from the
  current level's own pair of numbers: the ratio is `capacityAtLevel / requiredAtLevel`, and the
  `clamp01` is the cap, so surplus raw material is neither converted nor pulled in the first
  place. This is the same shape as the existing global `produce()` pooling logic in
  [../pages/supply-demand.ts](../pages/supply-demand.ts), just re-run per node per iteration
  against that iteration's delivered-raw-material estimate instead of an unconstrained global
  pool.
- **An unknown coefficient makes its entity inert, with a console warning.** Levels not yet
  discovered (`productionByLevel`/`amountByLevel` entries left `undefined`) are the user's own gap
  in the data, not the solver's problem to solve around. Leaving one undefined is a user error, so
  the solver owes it no accuracy — only convergence and a *localized* error. So: if any coefficient
  the entity's current level needs is missing, that entity contributes nothing at all. An industry
  with an unknown raw-material need or product capacity neither produces nor pulls raw material; a
  rural business with an unknown production figure produces nothing. The solver `console.warn`s the
  missing coefficient so it's noticeable, without building dedicated "unknown" UI state.

## Contradictions to settle

The decisions recorded above conflict with the spec, or with themselves, in four places.

- [x] **Warehouse balance contradicts the spec outright.** Settled in favour of the section above,
      and the spec's "Goods Flow Solver" section amended to match: a warehouse has no demand or
      supply of *its own*, but exposes its host's just as a station does, minus what `goods` gates
      out.
- [x] **Split weight: leg capacity or realized per-good volume?** Capacity, rationed to the good
      by the backward pressure pass. Settled by demanding *line-splitting invariance* — booking
      the same trains as one line or as two parallel ones must not change any flow — which
      capacity satisfies by being additive and realized flow does not; see the spec for the
      argument. Worth a test case, and note the axiom also binds the backward pass.
- [x] **The constant-ratio argument does not carry its weight.** Dropped from the reasoning, and
      the rule restated in the spec as ratio *and* cap, both taken from the current level's own
      pair of numbers. That the ratio also holds across levels is true but unused here; its one
      possible use — deriving a coefficient the player has not entered from level 1 — belongs to
      the unknown-coefficient point below, and would only be approximate anyway, the stored tables
      being rounded (Brewery level 4 is 5.5 → 11.1, not 5.6 → 11.2).
- [x] **"Ignore unknown coefficients" biases in two opposite directions.** Settled by dropping the
      *entity*, not the term: an unknown coefficient anywhere in the current level's row makes the
      industry or rural business inert, so both positions deflate and neither inflates. A missing
      raw-material need never leaves an industry less constrained, because it no longer produces at
      all. Convergence is untouched — an inert node is a constant zero, one fewer term in the fixed
      point, and no undefined value ever enters the iteration — and the error stays where the
      missing data is: that node reads zero output and zero fulfilment, and consumers of its product
      read as under-served rather than being handed goods that would never arrive.

## Gaps to resolve, step by step

- [ ] **Cities gate unloading, much like warehouses.** The spec notes that goods a city does not
      demand "cannot be unloaded" there, so a station hosting a city is good-gated too, not just a
      warehouse. Decide the exact gate (population demand only, or also its industries' raw
      materials) and how it reaches `handledGoods` in [solver-types.ts](solver-types.ts).
- [ ] **Local netting at a node is undefined.** When one node hosts both a producer and a consumer
      of the same good — a city industry's output feeding that city's population, or a rural
      business feeding a co-hosted industry — decide whether the match is satisfied locally with no
      leg involved, or whether everything has to ride a train. This changes every `served` figure
      and the fulfilment fractions read back per entity.
- [ ] **`cargo: 'anything'` lines overstate goods capacity.** Such lines also carry passengers and
      mail, yet the full `trains × 8 × 7 / tourDays` is currently credited to goods. Decide whether
      to model a split, apply a flat discount, or knowingly accept the overestimate.
- [ ] **Station and warehouse size constrains nothing.** Track-based capacity is listed above as
      something the domain model provides, but no node throughput limit appears anywhere in the
      algorithm — even though the spec names congestion as the very reason warehouses exist. Decide
      whether to model a per-node weekly turn-over cap from track count, or to drop the claim.
- [ ] **Convergence is unspecified.** Fix the damping factor, the tolerance defining convergence,
      the iteration cap, and what the solver returns when it hits that cap without converging;
      `SolveOptions` in [solver-types.ts](solver-types.ts) currently assumes all four.
- [ ] **Out-of-scope mechanics are silently dropped.** The spec's special buildings acting as
      infinite sinks, and the per-city storage limit, are modelled nowhere. Decide whether they stay
      out of scope, and say so explicitly. Related: the opening sentence above still claims nothing
      is implemented, which `solver-types.ts` has since made untrue.
