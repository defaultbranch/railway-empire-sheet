import { sankeyCircular, type SankeyLink } from 'd3-sankey-circular';
import type { FlowDiagramLink, FlowDiagramNode } from './goods-flow';

type LayoutLink = SankeyLink<FlowDiagramNode, FlowDiagramLink>;

export const flowNodeLabelOffset = 50;

function crossings(links: LayoutLink[]): number {
  let count = 0;
  const forward = links.filter((link) => link.source.x1 < link.target.x0);
  for (let first = 0; first < forward.length; first++) {
    const left = forward[first];
    for (const right of forward.slice(first + 1)) {
      if (left.source === right.source || left.target === right.target) continue;
      const start = Math.max(left.source.x1, right.source.x1);
      const end = Math.min(left.target.x0, right.target.x0);
      if (start >= end) continue;
      const position = (link: LayoutLink, horizontal: number) => link.y0
        + (link.y1 - link.y0) * (horizontal - link.source.x1) / (link.target.x0 - link.source.x1);
      if ((position(left, start) - position(right, start))
        * (position(left, end) - position(right, end)) < 0) count++;
    }
  }
  return count;
}

export function layoutGoodsFlow(nodes: FlowDiagramNode[], links: FlowDiagramLink[], height: number) {
  const onlyIncoming = nodes.every((node) => node.column !== undefined && node.column < 2);
  const arrange = (ordered: FlowDiagramNode[]) => {
    const graph = sankeyCircular<FlowDiagramNode, FlowDiagramLink>()
    .nodeId((node) => node.id).nodeWidth(18).nodePadding(58)
    .nodeAlign((node, columns) => node.column ?? (node.role === 'producer' ? 0
      : node.role === 'consumer' ? columns - 1 : node.depth))
    .extent([[120, 64], [onlyIncoming ? (120 + 1280 + 18) / 2 : 1280, height - 48]])({
      nodes: ordered.map((node) => {
        let transportedAmount = 0;
        return {
          ...node,
          get value() {
            return Math.max(transportedAmount,
              node.segments?.reduce((sum, segment) => sum + Math.max(segment.incoming, segment.outgoing, segment.capacity ?? 0), 0)
                ?? (node.role === 'producer' || node.role === 'consumer' ? node.requested : 0));
          },
          set value(amount: number) { transportedAmount = amount; },
        };
      }),
      links: links.map((link) => ({ ...link })),
    });
    for (const node of graph.nodes) {
      let offset = 0;
      for (const segment of node.segments ?? []) {
        const segmentTop = node.y0 + (node.y1 - node.y0) * offset / node.value;
        for (const outgoing of [true, false]) {
          const attached = graph.links.filter((link) => link.good === segment.good
            && (outgoing ? link.source === node : link.target === node));
          attached.sort((left, right) => outgoing ? left.target.y0 - right.target.y0 : left.source.y0 - right.source.y0);
          let position = segmentTop;
          for (const link of attached) {
            if (outgoing) link.y0 = position + link.width / 2;
            else link.y1 = position + link.width / 2;
            position += link.width;
          }
        }
        offset += Math.max(segment.incoming, segment.outgoing, segment.capacity ?? 0);
      }
    }
    for (const link of graph.links) {
      if (!link.source.segments && !link.target.segments) continue;
      const middle = (link.source.x1 + link.target.x0) / 2;
      link.path = `M${link.source.x1},${link.y0}C${middle},${link.y0} ${middle},${link.y1} ${link.target.x0},${link.y1}`;
    }
    return graph;
  };

  let best = arrange(nodes);
  let bestCrossings = crossings(best.links);
  let current = best;
  for (let pass = 0; pass < 8 && bestCrossings > 0; pass++) {
    const neighbors = new Map<string, { total: number; weight: number }>();
    for (const link of current.links) {
      if (link.source.x1 >= link.target.x0) continue;
      const node = pass % 2 === 0 ? link.target : link.source;
      const neighbor = pass % 2 === 0 ? link.source : link.target;
      const score = neighbors.get(node.id) ?? { total: 0, weight: 0 };
      score.total += (neighbor.y0 + neighbor.y1) / 2 * link.value;
      score.weight += link.value;
      neighbors.set(node.id, score);
    }
    const position = (node: typeof current.nodes[number]) => {
      const score = neighbors.get(node.id);
      return score && score.weight > 0 ? score.total / score.weight : (node.y0 + node.y1) / 2;
    };
    const ordered = [...current.nodes].sort((left, right) => left.x0 - right.x0
      || position(left) - position(right) || left.id.localeCompare(right.id));
    current = arrange(ordered);
    const count = crossings(current.links);
    if (count < bestCrossings) {
      best = current;
      bestCrossings = count;
    }
  }
  const top = Math.min(0, ...best.nodes.map((node) => node.y0 - flowNodeLabelOffset - 8));
  const bottom = Math.max(height, ...best.nodes.map((node) => node.y1 + 8));
  return { ...best, top, height: bottom - top };
}
