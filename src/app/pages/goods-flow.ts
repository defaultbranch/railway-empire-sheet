import { pathForCity } from '../entities/city-routes';
import { pathForRuralBusiness } from '../entities/rural-business-routes';
import { pathForStation } from '../entities/station-routes';
import { pathForWarehouse } from '../entities/warehouse-routes';
import type { Contributor, FlowNetwork, FlowSolution } from '../solver/solver-types';

export type FlowDiagramNode = {
  id: string;
  label: string;
  path: string;
  role: 'producer' | 'consumer' | 'station' | 'warehouse';
  requested: number;
  served: number;
};

export type FlowDiagramLink = {
  source: string;
  target: string;
  value: number;
  forward: number;
  reverse: number;
};

function identity(contributor: Contributor): string {
  return JSON.stringify(contributor);
}

function contributorLabel(contributor: Contributor): string {
  if (contributor.kind === 'rural business') return contributor.name;
  if (contributor.kind === 'population') return `${contributor.city} population`;
  return `${contributor.city} industry ${contributor.slot}`;
}

export function buildGoodsFlowDiagram(network: FlowNetwork, solution: FlowSolution, good: string) {
  const nodes = new Map<string, FlowDiagramNode>();
  const entities = new Map<string, FlowDiagramNode>();
  const links: FlowDiagramLink[] = [];
  const roles = new Map<string, Set<'producer' | 'consumer'>>();
  const register = (contributor: Contributor, role: 'producer' | 'consumer') => {
    const key = identity(contributor);
    const existing = roles.get(key) ?? new Set();
    existing.add(role);
    roles.set(key, existing);
  };
  for (const node of network.nodes) {
    const warehouse = node.id.startsWith('warehouse:');
    const name = node.id.slice(node.id.indexOf(':') + 1);
    nodes.set(node.id, {
      id: node.id, label: name, role: warehouse ? 'warehouse' : 'station',
      path: warehouse ? pathForWarehouse({ name }) : pathForStation({ name }),
      requested: 0, served: 0,
    });
    for (const source of node.sources) if (source.good === good) register(source.contributor, 'producer');
    for (const sink of node.sinks) if (sink.good === good) register(sink.contributor, 'consumer');
    for (const conversion of node.conversions) {
      if (conversion.products.some((product) => product.good === good)) register(conversion.contributor, 'producer');
      if (conversion.rawMaterials.some((material) => material.good === good)) register(conversion.contributor, 'consumer');
    }
  }
  for (const flow of solution.contributorFlows) {
    if (flow.good !== good) continue;
    for (const role of roles.get(identity(flow.contributor)) ?? []) {
      const id = `${role}:${identity(flow.contributor)}`;
      let entity = entities.get(id);
      if (entity === undefined) {
        entity = {
          id, role, label: contributorLabel(flow.contributor), requested: 0, served: 0,
          path: flow.contributor.kind === 'rural business'
            ? pathForRuralBusiness({ name: flow.contributor.name })
            : pathForCity({ name: flow.contributor.city }),
        };
        entities.set(id, entity);
        nodes.set(id, entity);
      }
      entity.requested += flow.requested;
      entity.served += flow.served;
      if (flow.served > 1e-4) {
        links.push({
          source: role === 'producer' ? id : flow.node,
          target: role === 'producer' ? flow.node : id,
          value: flow.served, forward: flow.served, reverse: 0,
        });
      }
    }
  }

  const legAmounts = new Map(solution.legFlows.filter((flow) => flow.good === good).map((flow) => [flow.leg, flow.units]));
  const exchanges = new Map<string, { first: string; second: string; forward: number; reverse: number }>();
  for (const leg of network.legs) {
    const [first, second] = [leg.from, leg.to].sort();
    const key = JSON.stringify([first, second]);
    const exchange = exchanges.get(key) ?? { first, second, forward: 0, reverse: 0 };
    if (leg.from === first) exchange.forward += legAmounts.get(leg.id) ?? 0;
    else exchange.reverse += legAmounts.get(leg.id) ?? 0;
    exchanges.set(key, exchange);
  }
  const transport: FlowDiagramLink[] = [];
  for (const exchange of exchanges.values()) {
    const net = exchange.forward - exchange.reverse;
    if (Math.abs(net) <= 1e-4) continue;
    transport.push({
      source: net > 0 ? exchange.first : exchange.second,
      target: net > 0 ? exchange.second : exchange.first,
      value: Math.abs(net),
      forward: net > 0 ? exchange.forward : exchange.reverse,
      reverse: net > 0 ? exchange.reverse : exchange.forward,
    });
  }
  links.push(...transport);
  const active = new Set(links.flatMap((link) => [link.source, link.target]));
  for (const link of links) {
    const source = nodes.get(link.source);
    const target = nodes.get(link.target);
    if (source?.role === 'station' || source?.role === 'warehouse') source.served += link.value;
    if (target?.role === 'station' || target?.role === 'warehouse') target.requested += link.value;
  }
  return {
    nodes: [...nodes.values()].filter((node) => active.has(node.id)), links, transport,
    producers: [...entities.values()].filter((node) => node.role === 'producer'),
    consumers: [...entities.values()].filter((node) => node.role === 'consumer'),
    allNodes: nodes,
  };
}