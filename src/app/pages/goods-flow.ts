import { pathForCity } from '../entities/city-routes';
import { pathForRuralBusiness } from '../entities/rural-business-routes';
import { pathForStation } from '../entities/station-routes';
import { pathForWarehouse } from '../entities/warehouse-routes';
import type { Contributor, FlowNetwork, FlowSolution, NodeId } from '../solver/solver-types';

export type FlowDiagramNode = {
  id: string;
  label: string;
  path: string;
  role: 'producer' | 'consumer' | 'station' | 'warehouse';
  requested: number;
  served: number;
  column?: number;
  good?: string;
  segments?: { good: string; incoming: number; outgoing: number; capacity?: number }[];
};

export type FlowDiagramLink = {
  source: string;
  target: string;
  value: number;
  forward: number;
  reverse: number;
  good?: string;
};

function identity(contributor: Contributor): string {
  return JSON.stringify(contributor);
}

function contributorLabel(contributor: Contributor): string {
  if (contributor.kind === 'rural business') return contributor.name;
  if (contributor.kind === 'population') return `${contributor.city} population`;
  return `${contributor.city} industry ${contributor.slot + 1}`;
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

export function buildWarehouseFlowDiagram(network: FlowNetwork, solution: FlowSolution, warehouse: NodeId) {
  const nodes = new Map<string, FlowDiagramNode>();
  const links: FlowDiagramLink[] = [];
  const goods = new Set([...network.goods, ...solution.legFlows.map((flow) => flow.good),
    ...solution.contributorFlows.map((flow) => flow.good)]);
  for (const good of goods) {
    const diagram = buildGoodsFlowDiagram(network, solution, good);
    const center = diagram.allNodes.get(warehouse);
    if (center === undefined) continue;
    const centerId = warehouse;
    for (const link of diagram.links) {
      if (link.source !== warehouse && link.target !== warehouse) continue;
      const inbound = link.target === warehouse;
      const neighbor = diagram.allNodes.get(inbound ? link.source : link.target);
      if (neighbor === undefined) continue;
      const neighborId = JSON.stringify([inbound ? 'in' : 'out', neighbor.id]);
      if (!nodes.has(centerId)) nodes.set(centerId, {
        ...center, id: centerId, column: 1, requested: 0, served: 0,
      });
      if (!nodes.has(neighborId)) nodes.set(neighborId, {
        ...neighbor, id: neighborId, column: inbound ? 0 : 2,
        requested: 0, served: 0,
      });
      const adjacent = nodes.get(neighborId)!;
      if (neighbor.role === 'producer' || neighbor.role === 'consumer') {
        if (!adjacent.segments?.some((segment) => segment.good === good)) adjacent.requested += neighbor.requested;
        adjacent.served += link.value;
      } else if (inbound) {
        adjacent.served += link.value;
      } else {
        adjacent.requested += link.value;
      }
      const central = nodes.get(centerId)!;
      if (inbound) central.requested += link.value;
      else central.served += link.value;
      for (const [node, incoming] of [[central, inbound], [adjacent, !inbound]] as const) {
        const segments = node.segments ??= [];
        let segment = segments.find((entry) => entry.good === good);
        if (segment === undefined) {
          segment = { good, incoming: 0, outgoing: 0 };
          segments.push(segment);
        }
        if (node.role === 'producer' || node.role === 'consumer') segment.capacity = neighbor.requested;
        if (incoming) segment.incoming += link.value;
        else segment.outgoing += link.value;
      }
      links.push({ ...link, good, source: inbound ? neighborId : centerId, target: inbound ? centerId : neighborId });
    }
  }
  return { nodes: [...nodes.values()], links };
}

export function buildIndustryFlowDiagram(
  network: FlowNetwork,
  solution: FlowSolution,
  industry: Extract<Contributor, { kind: 'industry' }>,
  direction: 'in' | 'out',
) {
  const nodes = new Map<string, FlowDiagramNode>();
  const links: FlowDiagramLink[] = [];
  const goods = new Set<string>();
  for (const node of network.nodes) {
    for (const conversion of node.conversions) {
      if (identity(conversion.contributor) !== identity(industry)) continue;
      for (const entry of direction === 'in' ? conversion.rawMaterials : conversion.products) goods.add(entry.good);
    }
  }
  const centerId = `${direction === 'in' ? 'consumer' : 'producer'}:${identity(industry)}`;
  for (const good of goods) {
    const diagram = buildGoodsFlowDiagram(network, solution, good);
    const reached = new Set([centerId]);
    const pending = [centerId];
    while (pending.length > 0) {
      const current = pending.pop()!;
      for (const link of diagram.links) {
        if ((direction === 'in' ? link.target : link.source) !== current) continue;
        const next = direction === 'in' ? link.source : link.target;
        if (!reached.has(next)) {
          reached.add(next);
          pending.push(next);
        }
      }
    }
    for (const link of diagram.links) {
      if (!reached.has(link.source) || !reached.has(link.target)) continue;
      links.push({ ...link, good });
      for (const [id, incoming] of [[link.source, false], [link.target, true]] as const) {
        const original = diagram.allNodes.get(id)!;
        let node = nodes.get(id);
        if (node === undefined) {
          node = { ...original, requested: 0, served: 0, segments: [] };
          nodes.set(id, node);
        }
        let segment = node.segments!.find((entry) => entry.good === good);
        if (segment === undefined) {
          segment = { good, incoming: 0, outgoing: 0 };
          if (node.role === 'producer' || node.role === 'consumer') {
            segment.capacity = original.requested;
            node.requested += original.requested;
          }
          node.segments!.push(segment);
        }
        if (incoming) segment.incoming += link.value;
        else segment.outgoing += link.value;
        if (node.role === 'producer' || node.role === 'consumer' || !incoming) node.served += link.value;
        else node.requested += link.value;
      }
    }
  }
  return { nodes: [...nodes.values()], links };
}
