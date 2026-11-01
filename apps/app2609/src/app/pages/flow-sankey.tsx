import type { MouseEvent } from 'react';
import type { FlowDiagramLink, FlowDiagramNode } from './goods-flow';
import { flowNodeLabelOffset, layoutGoodsFlow } from './goods-flow-layout';

const rate = (amount: number) => amount.toLocaleString(undefined, { maximumFractionDigits: 2 });
const percentage = (node: FlowDiagramNode) => node.requested > 0
  ? `${rate(100 * node.served / node.requested)}%` : '\u2014';

const goodColors = ['#19866e', '#bf563d', '#377bb5', '#b58a1f', '#b0456c', '#5a843c', '#168c97', '#886b53'];

/** Inputs for rendering a flow graph and handling navigation from its nodes. */
export type FlowSankeyProps = {
  /** The precomputed nodes and links to visualize. */
  diagram: { nodes: FlowDiagramNode[]; links: FlowDiagramLink[] };
  /** Context label and fallback good name for links without one. */
  good: string;
  /** Handles diagram-node activation, including navigation. */
  follow: (event: MouseEvent<HTMLElement | SVGElement>, path: string) => void;
  /** Whether link details include gross forward and reverse amounts; defaults to `true`. */
  showGross?: boolean;
};

/**
 * Renders a computed flow graph as a navigable Sankey diagram. Nodes represent
 * producers, consumers, or transport stops; links show net movement, with goods
 * distinguished visually. The containing view handles navigation through
 * `follow`. Set `showGross` to include forward and reverse quantities alongside
 * net flow. A graph with no realized links displays an empty state.
 *
 * @param props - The diagram data, context label, activation handler, and display options.
 */
export function FlowSankey(props: FlowSankeyProps) {
  const { diagram, good, follow, showGross = true } = props;
  if (diagram.links.length === 0) return <p className="goods-flow-page__empty">No realized flow for {good}.</p>;
  const goods = [...new Set(diagram.links.map((link) => link.good ?? good))].sort();
  const colors = new Map(goods.map((name, index) => [name,
    goodColors[index] ?? `hsl(${(index * 137.508) % 360} 65% 42%)`]));
  const goodColor = (name: string | undefined) => colors.get(name ?? good);
  const columns = new Map<string | number, number>();
  for (const node of diagram.nodes) {
    const column = node.column ?? (node.role === 'producer' ? 'producer' : node.role === 'consumer' ? 'consumer' : 'stops');
    columns.set(column, (columns.get(column) ?? 0) + 1);
  }
  const height = Math.max(360, Math.max(...columns.values()) * 64 + 120);
  const graph = layoutGoodsFlow(diagram.nodes, diagram.links, height);
  const bounds = graph.nodes.flatMap((node) => [node.x0, node.x1]);
  const width = Math.max(1400, ...bounds.map((bound) => bound + 120));
  return (
    <div className="goods-flow-page">
      <ul className="goods-flow-page__legend" aria-label="Goods color legend">
        {goods.map((name) => <li key={name}>
          <span className="goods-flow-page__swatch" style={{ backgroundColor: goodColor(name) }} aria-hidden="true" />
          <span>{name}</span>
        </li>)}
      </ul>
      <div className="goods-flow-page__diagram" role="region" aria-label={`${good} flow diagram`} tabIndex={0}>
      <svg width={width} height={graph.height} viewBox={`0 ${graph.top} ${width} ${graph.height}`} role="img" aria-label={`${good} net flow in units per week`}>
        <title>{`${good} net flow in units per week`}</title>
        {graph.links.map((link, index) => (
          <path key={index} data-good={link.good ?? good} d={link.path} strokeWidth={Math.max(1, link.width)} style={{ stroke: goodColor(link.good) }} className={`goods-flow-page__ribbon goods-flow-page__ribbon--${link.source.role}`}>
            <title>{`${link.good === undefined ? '' : `${link.good}: `}${link.source.label} → ${link.target.label}: ${rate(link.value)} units/week${showGross ? `\nGross forward: ${rate(link.forward)}; reverse: ${rate(link.reverse)} units/week` : ''}`}</title>
          </path>
        ))}
        {graph.nodes.map((node) => (
          <a key={node.id} href={node.path} onClick={(event) => follow(event, node.path)} style={{ fill: goodColor(node.good) }} className={`goods-flow-page__node goods-flow-page__node--${node.role}`}>
            <title>{`${node.label}\n${node.good === undefined ? '' : `${node.good}\n`}${node.role}\n${node.role === 'producer' || node.role === 'consumer'
              ? `${rate(node.served)} / ${rate(node.requested)} units/week; ${node.role === 'producer' ? 'utilization' : 'satisfaction'} ${percentage(node)}`
              : `In: ${rate(node.requested)}; out: ${rate(node.served)} units/week`}`}</title>
            <rect className={node.role === 'producer' || node.role === 'consumer' ? 'goods-flow-page__capacity' : undefined}
              x={node.x0} y={node.y0} width={node.x1 - node.x0} height={Math.max(2, node.y1 - node.y0)} />
            {node.segments?.map((segment, index, segments) => {
              const offset = segments.slice(0, index).reduce((sum, entry) => sum + Math.max(entry.incoming, entry.outgoing, entry.capacity ?? 0), 0);
              const top = node.y0 + (node.y1 - node.y0) * offset / node.value;
              return <g key={segment.good}>
                <title>{`${segment.good}: in ${rate(segment.incoming)} / out ${rate(segment.outgoing)} units/week${segment.capacity === undefined ? '' : `; ${node.role === 'producer' ? 'capacity' : 'demand'} ${rate(segment.capacity)}`}`}</title>
                <rect data-good={segment.good} style={{ fill: goodColor(segment.good), fillOpacity: segment.capacity === undefined ? 1 : 0.25 }}
                  x={node.x0} y={top} width={node.x1 - node.x0}
                  height={(node.y1 - node.y0) * Math.max(segment.incoming, segment.outgoing, segment.capacity ?? 0) / node.value} />
                {segment.capacity !== undefined && <rect style={{ fill: goodColor(segment.good) }}
                  x={node.x0} y={top} width={node.x1 - node.x0}
                  height={(node.y1 - node.y0) * Math.max(segment.incoming, segment.outgoing) / node.value} />}
              </g>;
            })}
            {!node.segments && (node.role === 'producer' || node.role === 'consumer') && <rect
              x={node.x0} y={node.y0} width={node.x1 - node.x0}
              height={(node.y1 - node.y0) * Math.min(1, node.value > 0 ? node.served / node.value : 0)} />}
            <foreignObject x={(node.x0 + node.x1) / 2 - 105} y={node.y0 - flowNodeLabelOffset} width={210} height={46}>
              <div className="goods-flow-page__node-label">
                <strong>{node.label}</strong>
                <span>{node.role === 'producer' || node.role === 'consumer'
                  ? `${rate(node.served)} / ${rate(node.requested)} units/week · ${percentage(node)}`
                  : node.column === 1 ? `In ${rate(node.requested)} / out ${rate(node.served)} units/week`
                  : `${rate(Math.max(node.served, node.requested))} units/week`}</span>
              </div>
            </foreignObject>
          </a>
        ))}
      </svg>
      </div>
    </div>
  );
}
