import type {
  City,
  GameState,
  Good,
  Industry,
  IndustryType,
  RuralBusiness,
  RuralBusinessType,
  StopHost,
  StopRef,
} from '../game-state/types';
import { demandForCity } from '../pages/population-demand';
import type { Contribution, Conversion, FlowNetwork, FlowNode, Leg, LegId, MissingCoefficient, NodeId } from './solver-types';

export type CompiledNetwork = {
  network: FlowNetwork;
  missingCoefficients: MissingCoefficient[];
  // lines left out of the network, with the reason, so views can explain a missing flow
  droppedLines: { line: string; reason: string }[];
};

// what a stop's host brings to the network, before the stop's own good gate is applied
type HostContent = {
  sources: Contribution[];
  sinks: Contribution[];
  conversions: Conversion[];
  produced: Set<Good>;
  consumed: Set<Good>;
};

function emptyHostContent(): HostContent {
  return { sources: [], sinks: [], conversions: [], produced: new Set(), consumed: new Set() };
}

// resolves one industry's recipe at its current level; a level whose table still has a gap makes the
// whole industry inert rather than dropping the one unknown term
function industryConversion(
  industry: Industry,
  type: IndustryType,
  missing: MissingCoefficient[],
): Conversion | undefined {
  const resolve = (flows: IndustryType['rawMaterials']) => {
    const resolved: { good: Good; amount: number }[] = [];
    let complete = true;
    for (const flow of flows) {
      if (flow.good === undefined) continue; // an unfilled recipe slot, not a gap in the tables
      const amount = flow.amountByLevel[industry.level];
      if (amount === undefined) {
        missing.push({ typeName: type.name, good: flow.good, level: industry.level });
        complete = false;
        continue;
      }
      resolved.push({ good: flow.good, amount });
    }
    return complete ? resolved : undefined;
  };

  const rawMaterials = resolve(type.rawMaterials);
  const products = resolve(type.products);
  if (rawMaterials === undefined || products === undefined) return undefined;

  return {
    contributor: { kind: 'industry', city: industry.city, slot: industry.citySlot },
    rawMaterials,
    products,
  };
}

function cityContent(
  cityName: string,
  state: GameState,
  missing: MissingCoefficient[],
): HostContent {
  const content = emptyHostContent();
  const city: City | undefined = state.cities.find((existing) => existing.name === cityName);
  if (city === undefined) return content;

  for (const demand of state.demands) {
    const amount = demandForCity(demand, city);
    if (amount <= 0) continue;
    content.sinks.push({ contributor: { kind: 'population', city: city.name }, good: demand.good, amount });
    content.consumed.add(demand.good);
  }

  for (const industry of state.industries.filter((existing) => existing.city === city.name)) {
    const type = state.industryTypes.find((existing) => existing.name === industry.typeName);
    if (type === undefined) continue;
    const conversion = industryConversion(industry, type, missing);
    if (conversion === undefined) continue;
    content.conversions.push(conversion);
    for (const rawMaterial of conversion.rawMaterials) content.consumed.add(rawMaterial.good);
    for (const product of conversion.products) content.produced.add(product.good);
  }

  return content;
}

function ruralContent(names: readonly string[], state: GameState, missing: MissingCoefficient[]): HostContent {
  const content = emptyHostContent();

  for (const name of names) {
    const business: RuralBusiness | undefined = state.ruralBusinesses.find((existing) => existing.name === name);
    if (business === undefined) continue;
    const type: RuralBusinessType | undefined = state.ruralBusinessTypes.find(
      (existing) => existing.name === business.typeName,
    );
    if (type === undefined) continue;
    const amount = type.productionByLevel[business.level];
    if (amount === undefined) {
      missing.push({ typeName: type.name, good: type.good, level: business.level });
      continue;
    }
    content.sources.push({ contributor: { kind: 'rural business', name: business.name }, good: type.good, amount });
    content.produced.add(type.good);
  }

  return content;
}

function hostContent(host: StopHost, state: GameState, missing: MissingCoefficient[]): HostContent {
  return host.kind === 'city'
    ? cityContent(host.city, state, missing)
    : ruralContent(host.ruralBusinesses, state, missing);
}

export function stopNodeId(stop: StopRef): NodeId {
  return stop.kind === 'station' ? `station:${stop.name}` : `warehouse:${stop.name}`;
}

export function compileFlowNetwork(state: GameState): CompiledNetwork {
  const missingCoefficients: MissingCoefficient[] = [];
  const droppedLines: { line: string; reason: string }[] = [];
  const nodes: FlowNode[] = [];

  for (const station of state.trainStations) {
    const content = hostContent(station.host, state, missingCoefficients);
    nodes.push({
      id: `station:${station.name}`,
      // a city takes what it consumes and passes everything else on; a rural stop takes nothing
      unloadableGoods: content.consumed,
      loadableGoods: new Set([...content.consumed, ...content.produced]),
      sources: content.sources,
      sinks: content.sinks,
      conversions: content.conversions,
    });
  }

  for (const warehouse of state.warehouses) {
    const content = hostContent(warehouse.host, state, missingCoefficients);
    const stocked = new Set(warehouse.goods);
    nodes.push({
      id: `warehouse:${warehouse.name}`,
      unloadableGoods: stocked,
      loadableGoods: new Set(stocked),
      sources: content.sources,
      sinks: content.sinks,
      conversions: content.conversions,
    });
  }

  const nodeIds = new Set(nodes.map((node) => node.id));
  const legs: Leg[] = [];

  for (const line of state.trainLines) {
    if (line.cargo === 'mail and passengers') {
      droppedLines.push({ line: line.name, reason: 'carries no goods' });
      continue;
    }
    if (line.tourDays === undefined || line.tourDays <= 0) {
      droppedLines.push({ line: line.name, reason: 'tour duration not known yet' });
      continue;
    }
    if (line.stops.length !== 2) {
      droppedLines.push({ line: line.name, reason: 'only two-stop lines are modelled' });
      continue;
    }
    const from = stopNodeId(line.stops[0]);
    const to = stopNodeId(line.stops[1]);
    if (!nodeIds.has(from) || !nodeIds.has(to) || from === to) {
      droppedLines.push({ line: line.name, reason: 'stops do not resolve to two distinct stations or warehouses' });
      continue;
    }
    // a train carries up to eight units per run, whatever it carries, so capacity is shared across goods
    const capacity = (line.trains * 8 * 7) / line.tourDays;
    const forward: LegId = `${line.name}@0`;
    const backward: LegId = `${line.name}@1`;
    legs.push({ id: forward, line: line.name, from, to, capacity });
    legs.push({ id: backward, line: line.name, from: to, to: from, capacity });
  }

  const goods = new Set<Good>(state.goods);
  for (const node of nodes) {
    for (const good of node.loadableGoods) goods.add(good);
    for (const good of node.unloadableGoods) goods.add(good);
    for (const source of node.sources) goods.add(source.good);
    for (const sink of node.sinks) goods.add(sink.good);
    for (const conversion of node.conversions) {
      for (const rawMaterial of conversion.rawMaterials) goods.add(rawMaterial.good);
      for (const product of conversion.products) goods.add(product.good);
    }
  }

  return { network: { goods: [...goods], nodes, legs }, missingCoefficients, droppedLines };
}
