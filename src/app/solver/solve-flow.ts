import type { Good } from '../game-state/types';
import type {
  Contribution,
  Contributor,
  ContributorFlow,
  Conversion,
  FlowNetwork,
  FlowNode,
  FlowSolution,
  Leg,
  LegFlow,
  LegId,
  NodeFlow,
  NodeId,
  SolveOptions,
} from './solver-types';

export const defaultSolveOptions: SolveOptions = { damping: 0.5, tolerance: 1e-4, maxIterations: 200 };

const epsilon = 1e-9;

export function contributorKey(contributor: Contributor): string {
  switch (contributor.kind) {
    case 'rural business':
      return `rural business:${contributor.name}`;
    case 'industry':
      return `industry:${contributor.city}:${contributor.slot}`;
    case 'population':
      return `population:${contributor.city}`;
  }
}

function add(map: Map<Good, number>, good: Good, amount: number): void {
  map.set(good, (map.get(good) ?? 0) + amount);
}

function nested(map: Map<string, Map<Good, number>>, key: string, good: Good, amount: number): void {
  let inner = map.get(key);
  if (inner === undefined) {
    inner = new Map();
    map.set(key, inner);
  }
  inner.set(good, (inner.get(good) ?? 0) + amount);
}

// proportional allocation of `total` over items weighted by `weights`, none taking more than its cap;
// what a capped item cannot take is redistributed over the rest, still in proportion. Proportional
// allocation by an additive weight is what makes the solve invariant under splitting a line in two
function waterfill(total: number, weights: number[], caps: number[]): number[] {
  const given = weights.map(() => 0);
  let remaining = total;

  for (let round = 0; round <= weights.length && remaining > epsilon; round++) {
    const active = (index: number) => weights[index] > 0 && given[index] < caps[index] - epsilon;
    let totalWeight = 0;
    for (let index = 0; index < weights.length; index++) if (active(index)) totalWeight += weights[index];
    if (totalWeight <= 0) break;

    let placed = 0;
    for (let index = 0; index < weights.length; index++) {
      if (!active(index)) continue;
      const give = Math.min((remaining * weights[index]) / totalWeight, caps[index] - given[index]);
      given[index] += give;
      placed += give;
    }
    if (placed <= epsilon) break;
    remaining -= placed;
  }

  return given;
}

// nodes tied together by a shared host: one city or rural business listed by several stops makes all
// of them one place as far as local production and consumption go, since netting needs no train
type Locality = {
  nodes: FlowNode[];
  sources: Contribution[];
  sinks: Contribution[];
  conversions: Conversion[];
};

function buildLocalities(nodes: FlowNode[]): Locality[] {
  const parent = nodes.map((_, index) => index);
  const find = (index: number): number => {
    let root = index;
    while (parent[root] !== root) root = parent[root];
    let walk = index;
    while (parent[walk] !== root) {
      const next = parent[walk];
      parent[walk] = root;
      walk = next;
    }
    return root;
  };
  const union = (a: number, b: number) => {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) parent[rootB] = rootA;
  };

  const firstSeen = new Map<string, number>();
  nodes.forEach((node, index) => {
    const keys = [
      ...node.sources.map((source) => contributorKey(source.contributor)),
      ...node.sinks.map((sink) => contributorKey(sink.contributor)),
      ...node.conversions.map((conversion) => contributorKey(conversion.contributor)),
    ];
    for (const key of keys) {
      const seen = firstSeen.get(key);
      if (seen === undefined) firstSeen.set(key, index);
      else union(seen, index);
    }
  });

  const byRoot = new Map<number, Locality>();
  nodes.forEach((node, index) => {
    const root = find(index);
    let locality = byRoot.get(root);
    if (locality === undefined) {
      locality = { nodes: [], sources: [], sinks: [], conversions: [] };
      byRoot.set(root, locality);
    }
    locality.nodes.push(node);
  });

  // a host listed by several stops contributes once, not once per stop
  for (const locality of byRoot.values()) {
    const seenContributions = new Set<string>();
    const seenConversions = new Set<string>();
    for (const node of locality.nodes) {
      for (const source of node.sources) {
        const key = `${contributorKey(source.contributor)}|${source.good}`;
        if (seenContributions.has(key)) continue;
        seenContributions.add(key);
        locality.sources.push(source);
      }
      for (const sink of node.sinks) {
        const key = `${contributorKey(sink.contributor)}|${sink.good}`;
        if (seenContributions.has(key)) continue;
        seenContributions.add(key);
        locality.sinks.push(sink);
      }
      for (const conversion of node.conversions) {
        const key = contributorKey(conversion.contributor);
        if (seenConversions.has(key)) continue;
        seenConversions.add(key);
        locality.conversions.push(conversion);
      }
    }
  }

  return [...byRoot.values()];
}

type LocalityNetting = {
  // production plus everything trains brought in, before local consumption
  poolIn: Map<Good, number>;
  // what is left for the network once the locality has taken its own share
  exportable: Map<Good, number>;
  // demand the locality cannot cover itself; the pull it exerts on the network, independent of
  // what happens to arrive this round, so the iteration does not oscillate around its own inflow
  netNeed: Map<Good, number>;
  // delivered or locally covered amount per consuming contributor
  consumerServed: Map<string, Map<Good, number>>;
  conversionOutput: Map<string, Map<Good, number>>;
};

function netLocality(
  locality: Locality,
  inflow: Map<Good, number>,
  previousOutput: Map<string, Map<Good, number>>,
): LocalityNetting {
  const production = new Map<Good, number>();
  for (const source of locality.sources) add(production, source.good, source.amount);
  for (const conversion of locality.conversions) {
    const output = previousOutput.get(contributorKey(conversion.contributor));
    for (const product of conversion.products) add(production, product.good, output?.get(product.good) ?? 0);
  }

  const populationDemand = new Map<Good, number>();
  for (const sink of locality.sinks) add(populationDemand, sink.good, sink.amount);
  const industryDemand = new Map<Good, number>();
  for (const conversion of locality.conversions) {
    for (const rawMaterial of conversion.rawMaterials) add(industryDemand, rawMaterial.good, rawMaterial.amount);
  }

  const poolIn = new Map<Good, number>();
  for (const [good, amount] of production) add(poolIn, good, amount);
  for (const [good, amount] of inflow) add(poolIn, good, amount);

  const pool = new Map(poolIn);
  const consumerServed = new Map<string, Map<Good, number>>();

  // population holds strict priority over the city's own industries
  for (const [good, demanded] of populationDemand) {
    if (demanded <= 0) continue;
    const available = pool.get(good) ?? 0;
    const taken = Math.min(demanded, available);
    pool.set(good, available - taken);
    for (const sink of locality.sinks) {
      if (sink.good !== good) continue;
      nested(consumerServed, contributorKey(sink.contributor), good, (taken * sink.amount) / demanded);
    }
  }

  // same-type contributors share what is left in proportion to their own volume, no priority order
  for (const [good, demanded] of industryDemand) {
    if (demanded <= 0) continue;
    const available = pool.get(good) ?? 0;
    const taken = Math.min(demanded, available);
    pool.set(good, available - taken);
    for (const conversion of locality.conversions) {
      const need = conversion.rawMaterials.find((rawMaterial) => rawMaterial.good === good)?.amount ?? 0;
      if (need <= 0) continue;
      nested(consumerServed, contributorKey(conversion.contributor), good, (taken * need) / demanded);
    }
  }

  const conversionOutput = new Map<string, Map<Good, number>>();
  for (const conversion of locality.conversions) {
    const key = contributorKey(conversion.contributor);
    const delivered = consumerServed.get(key);
    let multiplier = 1;
    for (const rawMaterial of conversion.rawMaterials) {
      if (rawMaterial.amount <= 0) continue;
      multiplier = Math.min(multiplier, (delivered?.get(rawMaterial.good) ?? 0) / rawMaterial.amount);
    }
    multiplier = Math.max(0, Math.min(1, multiplier));
    // raw material delivered but left unconverted for want of a scarcer one stays at the industry
    const output = new Map<Good, number>();
    for (const product of conversion.products) output.set(product.good, product.amount * multiplier);
    conversionOutput.set(key, output);
  }

  const netNeed = new Map<Good, number>();
  for (const good of new Set([...populationDemand.keys(), ...industryDemand.keys()])) {
    const need =
      (populationDemand.get(good) ?? 0) + (industryDemand.get(good) ?? 0) - (production.get(good) ?? 0);
    if (need > epsilon) netNeed.set(good, need);
  }

  const exportable = new Map<Good, number>();
  for (const [good, amount] of pool) if (amount > epsilon) exportable.set(good, amount);

  return { poolIn, exportable, netNeed, consumerServed, conversionOutput };
}

export function solveFlowNetwork(
  network: FlowNetwork,
  options: SolveOptions = defaultSolveOptions,
): Omit<FlowSolution, 'missingCoefficients'> {
  const nodesById = new Map(network.nodes.map((node) => [node.id, node] as const));
  const localities = buildLocalities(network.nodes);
  const localityOfNode = new Map<NodeId, number>();
  localities.forEach((locality, index) => {
    for (const node of locality.nodes) localityOfNode.set(node.id, index);
  });

  const incoming = new Map<NodeId, Leg[]>(network.nodes.map((node) => [node.id, []]));
  const outgoing = new Map<NodeId, Leg[]>(network.nodes.map((node) => [node.id, []]));
  const carriable = new Map<LegId, Good[]>();
  const legsOutOfLocality: Leg[][] = localities.map(() => []);

  for (const leg of network.legs) {
    const from = nodesById.get(leg.from);
    const to = nodesById.get(leg.to);
    if (from === undefined || to === undefined) continue;
    outgoing.get(leg.from)?.push(leg);
    incoming.get(leg.to)?.push(leg);
    carriable.set(
      leg.id,
      network.goods.filter((good) => from.loadableGoods.has(good) && to.unloadableGoods.has(good)),
    );
    const locality = localityOfNode.get(leg.from);
    if (locality !== undefined) legsOutOfLocality[locality].push(leg);
  }

  const inboundCapacity = new Map<NodeId, Map<Good, number>>();
  for (const node of network.nodes) {
    const capacities = new Map<Good, number>();
    for (const leg of incoming.get(node.id) ?? []) {
      for (const good of carriable.get(leg.id) ?? []) add(capacities, good, leg.capacity);
    }
    inboundCapacity.set(node.id, capacities);
  }

  const flow = new Map<LegId, Map<Good, number>>(
    network.legs.map((leg) => [leg.id, new Map((carriable.get(leg.id) ?? []).map((good) => [good, 0]))]),
  );
  // optimistic to start with: every good a leg can carry may claim the whole leg
  const rationed = new Map<LegId, Map<Good, number>>(
    network.legs.map((leg) => [leg.id, new Map((carriable.get(leg.id) ?? []).map((good) => [good, leg.capacity]))]),
  );
  let conversionOutput = new Map<string, Map<Good, number>>();
  let netting: LocalityNetting[] = [];
  let iterations = 0;
  let converged = false;

  const pull = new Map<NodeId, Map<Good, number>>(network.nodes.map((node) => [node.id, new Map<Good, number>()]));

  while (iterations < options.maxIterations) {
    iterations++;

    const inflowByLocality = localities.map(() => new Map<Good, number>());
    for (const leg of network.legs) {
      const locality = localityOfNode.get(leg.to);
      if (locality === undefined) continue;
      for (const [good, units] of flow.get(leg.id) ?? []) {
        if (units > epsilon) add(inflowByLocality[locality], good, units);
      }
    }

    netting = localities.map((locality, index) =>
      netLocality(locality, inflowByLocality[index], conversionOutput),
    );
    conversionOutput = new Map();
    for (const result of netting) {
      for (const [key, output] of result.conversionOutput) conversionOutput.set(key, output);
    }

    // backwards pass: unmet demand spreads over the stops that can take the good, then upstream
    // through every leg that can carry it, bounded by the capacity last rationed to that good
    const localNeed = new Map<NodeId, Map<Good, number>>(network.nodes.map((node) => [node.id, new Map()]));
    localities.forEach((locality, index) => {
      for (const [good, need] of netting[index].netNeed) {
        const eligible = locality.nodes.filter((node) => node.unloadableGoods.has(good));
        if (eligible.length === 0) continue;
        const weights = eligible.map((node) => inboundCapacity.get(node.id)?.get(good) ?? 0);
        const total = weights.reduce((sum, weight) => sum + weight, 0);
        eligible.forEach((node, position) => {
          const share = total > 0 ? weights[position] / total : 1 / eligible.length;
          localNeed.get(node.id)?.set(good, need * share);
        });
      }
    });

    for (const map of pull.values()) map.clear();
    for (let sweep = 0; sweep <= network.nodes.length; sweep++) {
      let changed = false;
      for (const node of network.nodes) {
        for (const good of network.goods) {
          if (!node.unloadableGoods.has(good)) continue;
          let value = localNeed.get(node.id)?.get(good) ?? 0;
          if (node.loadableGoods.has(good)) {
            for (const leg of outgoing.get(node.id) ?? []) {
              const onward = pull.get(leg.to)?.get(good) ?? 0;
              if (onward <= 0) continue;
              value += Math.min(rationed.get(leg.id)?.get(good) ?? 0, onward);
            }
          }
          if (value <= epsilon) continue;
          const previous = pull.get(node.id)?.get(good) ?? 0;
          if (value - previous > epsilon) {
            pull.get(node.id)?.set(good, value);
            changed = true;
          }
        }
      }
      if (!changed) break;
    }

    for (const leg of network.legs) {
      const goods = carriable.get(leg.id) ?? [];
      const pressures = goods.map((good) => Math.min(leg.capacity, pull.get(leg.to)?.get(good) ?? 0));
      const shares = waterfill(leg.capacity, pressures, pressures);
      rationed.set(leg.id, new Map(goods.map((good, index) => [good, shares[index]])));
    }

    // forwards pass: every locality pushes its surplus onto the legs leaving it, in proportion to
    // the capacity each has rationed to that good, and never beyond what the far end can absorb
    const target = new Map<LegId, Map<Good, number>>(
      network.legs.map((leg) => [leg.id, new Map((carriable.get(leg.id) ?? []).map((good) => [good, 0]))]),
    );
    const legRemaining = new Map<LegId, number>(network.legs.map((leg) => [leg.id, leg.capacity]));

    localities.forEach((_, index) => {
      const legs = legsOutOfLocality[index];
      if (legs.length === 0) return;
      const remaining = new Map(netting[index].exportable);

      const place = (good: Good, capOf: (leg: Leg) => number, weightOf: (leg: Leg) => number) => {
        const left = remaining.get(good) ?? 0;
        if (left <= epsilon) return;
        const candidates = legs.filter((leg) => (carriable.get(leg.id) ?? []).includes(good));
        if (candidates.length === 0) return;
        const caps = candidates.map((leg) => Math.max(0, Math.min(capOf(leg), legRemaining.get(leg.id) ?? 0)));
        const given = waterfill(left, candidates.map(weightOf), caps);
        candidates.forEach((leg, position) => {
          if (given[position] <= epsilon) return;
          target.get(leg.id)?.set(good, (target.get(leg.id)?.get(good) ?? 0) + given[position]);
          legRemaining.set(leg.id, (legRemaining.get(leg.id) ?? 0) - given[position]);
          remaining.set(good, (remaining.get(good) ?? 0) - given[position]);
        });
      };

      const headroom = (leg: Leg, good: Good) =>
        (pull.get(leg.to)?.get(good) ?? 0) - (target.get(leg.id)?.get(good) ?? 0);

      for (const good of remaining.keys()) {
        place(
          good,
          (leg) => Math.min(rationed.get(leg.id)?.get(good) ?? 0, pull.get(leg.to)?.get(good) ?? 0),
          (leg) => rationed.get(leg.id)?.get(good) ?? 0,
        );
      }
      // capacity rationed to a good no one can supply would otherwise go to waste
      for (const good of remaining.keys()) place(good, (leg) => headroom(leg, good), (leg) => leg.capacity);
    });

    let largestChange = 0;
    for (const leg of network.legs) {
      const current = flow.get(leg.id);
      const wanted = target.get(leg.id);
      if (current === undefined || wanted === undefined) continue;
      for (const good of carriable.get(leg.id) ?? []) {
        const before = current.get(good) ?? 0;
        const next = before + options.damping * ((wanted.get(good) ?? 0) - before);
        largestChange = Math.max(largestChange, Math.abs(next - before));
        current.set(good, next);
      }
    }

    if (largestChange < options.tolerance) {
      converged = true;
      break;
    }
  }

  return {
    ...readResults(network, localities, localityOfNode, legsOutOfLocality, netting, flow),
    iterations,
    converged,
  };
}

function readResults(
  network: FlowNetwork,
  localities: Locality[],
  localityOfNode: Map<NodeId, number>,
  legsOutOfLocality: Leg[][],
  netting: LocalityNetting[],
  flow: Map<LegId, Map<Good, number>>,
): Pick<FlowSolution, 'legFlows' | 'nodeFlows' | 'contributorFlows'> {
  const legFlows: LegFlow[] = [];
  for (const leg of network.legs) {
    for (const [good, units] of flow.get(leg.id) ?? []) {
      if (units > epsilon) legFlows.push({ leg: leg.id, good, units });
    }
  }

  const loaded = new Map<NodeId, Map<Good, number>>(network.nodes.map((node) => [node.id, new Map()]));
  const unloaded = new Map<NodeId, Map<Good, number>>(network.nodes.map((node) => [node.id, new Map()]));
  for (const leg of network.legs) {
    for (const [good, units] of flow.get(leg.id) ?? []) {
      if (units <= epsilon) continue;
      const from = loaded.get(leg.from);
      const to = unloaded.get(leg.to);
      if (from !== undefined) add(from, good, units);
      if (to !== undefined) add(to, good, units);
    }
  }

  const nodeFlows: NodeFlow[] = [];
  for (const node of network.nodes) {
    const goods = new Set([...(loaded.get(node.id)?.keys() ?? []), ...(unloaded.get(node.id)?.keys() ?? [])]);
    for (const good of goods) {
      nodeFlows.push({
        node: node.id,
        good,
        loaded: loaded.get(node.id)?.get(good) ?? 0,
        unloaded: unloaded.get(node.id)?.get(good) ?? 0,
      });
    }
  }

  // a contributor belongs to a locality, not to a stop, so its figures are attributed back over the
  // stops hosting it, weighted by the traffic each of them actually handles for that good
  const splitOverNodes = (
    locality: Locality,
    good: Good,
    usable: (node: FlowNode) => boolean,
    traffic: Map<NodeId, Map<Good, number>>,
  ): { node: NodeId; share: number }[] => {
    const eligible = locality.nodes.filter(usable);
    const chosen = eligible.length > 0 ? eligible : locality.nodes;
    const weights = chosen.map((node) => traffic.get(node.id)?.get(good) ?? 0);
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    return chosen.map((node, index) => ({
      node: node.id,
      share: total > 0 ? weights[index] / total : 1 / chosen.length,
    }));
  };

  const contributorFlows: ContributorFlow[] = [];
  localities.forEach((locality, index) => {
    const result = netting[index];
    if (result === undefined) return;

    const outflow = new Map<Good, number>();
    for (const leg of legsOutOfLocality[index]) {
      if (localityOfNode.get(leg.to) === index) continue; // a leg back into the same locality ships nothing out
      for (const [good, units] of flow.get(leg.id) ?? []) if (units > epsilon) add(outflow, good, units);
    }

    // every unit in the pool stands the same chance of being used or shipped, so a producer's own
    // share of the pool is served in the same fraction as the pool as a whole
    const dispatchedFraction = (good: Good) => {
      const available = result.poolIn.get(good) ?? 0;
      if (available <= epsilon) return 0;
      const consumed = available - (result.exportable.get(good) ?? 0);
      return Math.max(0, Math.min(1, (consumed + (outflow.get(good) ?? 0)) / available));
    };

    const emit = (
      contributor: Contributor,
      good: Good,
      requested: number,
      served: number,
      usable: (node: FlowNode) => boolean,
      traffic: Map<NodeId, Map<Good, number>>,
    ) => {
      for (const { node, share } of splitOverNodes(locality, good, usable, traffic)) {
        if (share <= 0) continue;
        contributorFlows.push({ contributor, node, good, requested: requested * share, served: served * share });
      }
    };

    for (const source of locality.sources) {
      emit(
        source.contributor,
        source.good,
        source.amount,
        source.amount * dispatchedFraction(source.good),
        (node) => node.loadableGoods.has(source.good),
        loaded,
      );
    }

    for (const sink of locality.sinks) {
      emit(
        sink.contributor,
        sink.good,
        sink.amount,
        result.consumerServed.get(contributorKey(sink.contributor))?.get(sink.good) ?? 0,
        (node) => node.unloadableGoods.has(sink.good),
        unloaded,
      );
    }

    for (const conversion of locality.conversions) {
      const key = contributorKey(conversion.contributor);
      for (const rawMaterial of conversion.rawMaterials) {
        emit(
          conversion.contributor,
          rawMaterial.good,
          rawMaterial.amount,
          result.consumerServed.get(key)?.get(rawMaterial.good) ?? 0,
          (node) => node.unloadableGoods.has(rawMaterial.good),
          unloaded,
        );
      }
      for (const product of conversion.products) {
        const produced = result.conversionOutput.get(key)?.get(product.good) ?? 0;
        emit(
          conversion.contributor,
          product.good,
          product.amount,
          produced * dispatchedFraction(product.good),
          (node) => node.loadableGoods.has(product.good),
          loaded,
        );
      }
    }
  });

  return { legFlows, nodeFlows, contributorFlows };
}
