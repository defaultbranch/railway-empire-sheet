import type { Good, TrainLine } from '../game-state/types';
import { buildLocalities, contributorKey } from '@railway/shared';
import type { FlowNetwork, FlowSolution, Leg, NodeId } from '@railway/shared';

export const nominalDeliveryYield = 2000;

export type LineRevenue = {
  line: string;
  weeklyYield: number;
  weeklyYieldPerTrain: number;
  byGood: { good: Good; weeklyYield: number }[];
};

export type TransportRevenue = {
  lines: LineRevenue[];
  storageValues: {
    node: NodeId;
    good: Good;
    soldUnits: number;
    forwardedUnits: number;
    averageArrivalAgeWeeks: number | undefined;
    remainingYield: number | undefined;
  }[];
};

type Edge = { leg: Leg; from: number; to: number; units: number; days: number };

function cancelCycles(edges: Edge[], nodeCount: number): void {
  const outgoing = Array.from({ length: nodeCount }, (_, index) => edges.filter((edge) => edge.from === index));
  for (;;) {
    const active = new Set<number>();
    const finished = new Set<number>();
    const path: Edge[] = [];
    const visit = (node: number): Edge[] | undefined => {
      active.add(node);
      for (const edge of outgoing[node]) {
        if (edge.units <= 1e-9) continue;
        path.push(edge);
        if (active.has(edge.to)) {
          const start = path.findIndex((step) => step.from === edge.to);
          return path.slice(start);
        }
        if (!finished.has(edge.to)) {
          const cycle = visit(edge.to);
          if (cycle !== undefined) return cycle;
        }
        path.pop();
      }
      active.delete(node);
      finished.add(node);
      return undefined;
    };
    let cycle: Edge[] | undefined;
    for (let node = 0; node < nodeCount && cycle === undefined; node++) {
      if (!finished.has(node)) cycle = visit(node);
    }
    if (cycle === undefined) return;
    const cancelled = Math.min(...cycle.map((edge) => edge.units));
    for (const edge of cycle) edge.units -= cancelled;
  }
}

export function analyzeTransportRevenue(
  network: FlowNetwork,
  solution: Pick<FlowSolution, 'legFlows' | 'contributorFlows'>,
  trainLines: Pick<TrainLine, 'name' | 'trains' | 'tourDays'>[],
  payout = nominalDeliveryYield,
): TransportRevenue {
  const localities = buildLocalities(network.nodes);
  const localityOf = new Map(localities.flatMap((locality, index) => locality.nodes.map((node) => [node.id, index] as const)));
  const lineByName = new Map(trainLines.map((line) => [line.name, line]));
  const revenue = new Map(trainLines.map((line) => [line.name, new Map<Good, number>()]));
  const storage = new Map<NodeId, Map<Good, { soldUnits: number; forwardedUnits: number; value: number }>>();
  const arrivals = new Map<NodeId, Map<Good, { units: number; unitDays: number }>>();
  const legById = new Map(network.legs.map((leg) => [leg.id, leg]));

  for (const good of network.goods) {
    const consumers = localities.map((locality) => new Set([
      ...locality.sinks.filter((sink) => sink.good === good).map((sink) => contributorKey(sink.contributor)),
      ...locality.conversions.filter((conversion) => conversion.rawMaterials.some((material) => material.good === good))
        .map((conversion) => contributorKey(conversion.contributor)),
    ]));
    const consumed = localities.map(() => 0);
    for (const flow of solution.contributorFlows) {
      if (flow.good !== good) continue;
      const locality = localityOf.get(flow.node);
      if (locality !== undefined && consumers[locality].has(contributorKey(flow.contributor))) {
        consumed[locality] += flow.served;
      }
    }

    const edges: Edge[] = [];
    for (const flow of solution.legFlows) {
      if (flow.good !== good || flow.units <= 1e-9) continue;
      const leg = legById.get(flow.leg);
      if (leg === undefined) continue;
      const from = localityOf.get(leg.from);
      const to = localityOf.get(leg.to);
      const days = lineByName.get(leg.line)?.tourDays;
      if (from === undefined || to === undefined || from === to || days === undefined || !Number.isFinite(days) || days <= 0) continue;
      edges.push({ leg, from, to, units: flow.units, days: days / 2 });
    }
    cancelCycles(edges, localities.length);
    const outgoing = localities.map((_, index) => edges.filter((edge) => edge.from === index && edge.units > 1e-9));
    const sent = outgoing.map((group) => group.reduce((sum, edge) => sum + edge.units, 0));
    const received = localities.map(() => 0);
    for (const edge of edges) received[edge.to] += edge.units;

    const recordStorage = (locality: number, units: number, value: number, sold: boolean) => {
      for (const node of localities[locality].nodes) {
        if (!node.loadableGoods.has(good) && !node.unloadableGoods.has(good)) continue;
        const goods = storage.get(node.id) ?? new Map();
        const previous = goods.get(good) ?? { soldUnits: 0, forwardedUnits: 0, value: 0 };
        goods.set(good, {
          soldUnits: previous.soldUnits + (sold ? units : 0),
          forwardedUnits: previous.forwardedUnits + (sold ? 0 : units),
          value: previous.value + (sold ? 0 : units * value),
        });
        storage.set(node.id, goods);
      }
    };

    const recordArrival = (node: NodeId, units: number, days: number) => {
      const goods = arrivals.get(node) ?? new Map();
      const previous = goods.get(good) ?? { units: 0, unitDays: 0 };
      goods.set(good, { units: previous.units + units, unitDays: previous.unitDays + units * days });
      arrivals.set(node, goods);
    };

    const deliver = (path: Edge[], units: number, totalDays: number) => {
      if (path.length === 0 || units <= 1e-9) return;
      let elapsed = 0;
      recordStorage(path[0].from, units, payout, false);
      for (const [index, edge] of path.entries()) {
        const goods = revenue.get(edge.leg.line);
        if (goods !== undefined) goods.set(good, (goods.get(good) ?? 0) + units * payout * edge.days / totalDays);
        elapsed += edge.days;
        recordArrival(edge.leg.to, units, elapsed);
        recordStorage(edge.to, units, payout * Math.max(0, totalDays - elapsed) / totalDays, index === path.length - 1);
      }
    };

    const trace = (node: number, units: number, path: Edge[], days: number) => {
      const available = consumed[node] + sent[node];
      if (available <= 1e-9 || units <= 1e-9) return;
      deliver(path, units * consumed[node] / available, days);
      for (const edge of outgoing[node]) {
        trace(edge.to, units * edge.units / available, [...path, edge], days + edge.days);
      }
    };
    localities.forEach((_, index) => {
      const produced = Math.max(0, consumed[index] + sent[index] - received[index]);
      if (produced <= 1e-9) return;
      recordStorage(index, 0, 0, false);
      for (const node of localities[index].nodes) {
        if (node.loadableGoods.has(good)) recordArrival(node.id, produced, 0);
      }
      trace(index, produced, [], 0);
    });
  }

  return {
    lines: trainLines.map((line) => {
      const byGood = [...(revenue.get(line.name) ?? [])].map(([good, weeklyYield]) => ({ good, weeklyYield }))
        .sort((first, second) => second.weeklyYield - first.weeklyYield || first.good.localeCompare(second.good));
      const weeklyYield = byGood.reduce((sum, entry) => sum + entry.weeklyYield, 0);
      return { line: line.name, weeklyYield, weeklyYieldPerTrain: line.trains > 0 ? weeklyYield / line.trains : 0, byGood };
    }),
    storageValues: [...storage].flatMap(([node, goods]) => [...goods].map(([good, value]) => {
      const arrival = arrivals.get(node)?.get(good);
      return {
        node, good,
        soldUnits: value.soldUnits,
        forwardedUnits: value.forwardedUnits,
        averageArrivalAgeWeeks: arrival === undefined ? undefined : arrival.unitDays / arrival.units / 7,
        remainingYield: value.forwardedUnits > 0 ? value.value / value.forwardedUnits : undefined,
      };
    })),
  };
}
