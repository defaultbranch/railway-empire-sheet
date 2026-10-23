import { useEffect, useState, type MouseEvent } from 'react';
import { useGoods } from '../game-state/goods-state';
import { useNavigation } from '../navigation';
import { useGoodsFlow } from '../solver';
import { buildGoodsFlowDiagram, type FlowDiagramLink, type FlowDiagramNode } from './goods-flow';
import { flowNodeLabelOffset, layoutGoodsFlow } from './goods-flow-layout';

const rate = (amount: number) => amount.toLocaleString(undefined, { maximumFractionDigits: 2 });
const percentage = (node: FlowDiagramNode) => node.requested > 0
  ? `${rate(100 * node.served / node.requested)}%` : '\u2014';
const goodFromUrl = () => new URLSearchParams(window.location.search).get('good') ?? '';

const goodColors = ['#19866e', '#bf563d', '#377bb5', '#b58a1f', '#b0456c', '#5a843c', '#168c97', '#886b53'];

export function FlowSankey({ diagram, good, follow, showGross = true }: {
  diagram: { nodes: FlowDiagramNode[]; links: FlowDiagramLink[] };
  good: string;
  follow: (event: MouseEvent<HTMLElement | SVGElement>, path: string) => void;
  showGross?: boolean;
}) {
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

export function GoodsFlowPage() {
  const { goods } = useGoods();
  const { network, solution, droppedLines } = useGoodsFlow();
  const { navigate } = useNavigation();
  const [selectedGood, setSelectedGood] = useState(goodFromUrl);
  useEffect(() => {
    const onPopState = () => setSelectedGood(goodFromUrl());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  const chooseGood = (good: string) => {
    const url = new URL(window.location.href);
    if (good === '') url.searchParams.delete('good');
    else url.searchParams.set('good', good);
    window.history.pushState(null, '', `${url.pathname}${url.search}${url.hash}`);
    setSelectedGood(good);
  };
  const follow = (event: MouseEvent<HTMLElement | SVGElement>, path: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(path);
  };
  const diagram = buildGoodsFlowDiagram(network, solution, selectedGood);
  const validGood = goods.includes(selectedGood);
  return (
    <section className="goods-flow-page">
      <label className="goods-flow-page__selector" htmlFor="flow-good">Good
        <select id="flow-good" value={selectedGood} onChange={(event) => chooseGood(event.target.value)}>
          <option value="">Select good...</option>
          {selectedGood !== '' && !validGood && <option value={selectedGood}>{selectedGood} (unavailable)</option>}
          {goods.map((good) => <option key={good} value={good}>{good}</option>)}
        </select>
      </label>
      {!solution.converged && <p role="status">The solver did not converge after {solution.iterations} iterations. Flows are estimates.</p>}
      {solution.missingCoefficients.length > 0 && <p role="status">{solution.missingCoefficients.length} missing production figures; affected entities are excluded.</p>}
      {droppedLines.length > 0 && <details><summary>{droppedLines.length} excluded train lines</summary><ul>{droppedLines.map((line) => <li key={line.line}>{line.line}: {line.reason}</li>)}</ul></details>}
      {selectedGood === '' ? <p className="goods-flow-page__empty">No good selected.</p> : !validGood ? <p className="goods-flow-page__empty">This good is no longer registered.</p> : <>
        <FlowSankey diagram={diagram} good={selectedGood} follow={follow} />
        <div className="goods-flow-page__balances">
          {(['producer', 'consumer'] as const).map((role) => {
            const entities = role === 'producer' ? diagram.producers : diagram.consumers;
            return <details key={role}>
              <summary>{role === 'producer' ? 'Producers' : 'Consumers'} ({entities.length})</summary>
              {entities.length === 0 ? <p className="goods-flow-page__empty">None in the modeled network.</p> : <table className="goods-flow-page__table">
                <thead><tr><th>Entity</th><th>Actual units/week</th><th>{role === 'producer' ? 'Capacity' : 'Demand'} units/week</th><th>{role === 'producer' ? 'Utilization' : 'Satisfaction'}</th></tr></thead>
                <tbody>{entities.map((node) => <tr key={node.id}>
                  <td><a href={node.path} onClick={(event) => follow(event, node.path)}>{node.label}</a></td>
                  <td>{rate(node.served)}</td><td>{rate(node.requested)}</td><td>{percentage(node)}</td>
                </tr>)}</tbody>
              </table>}
            </details>;
          })}
        </div>
        {diagram.transport.length > 0 && <details className="goods-flow-page__transport-details">
          <summary>Net Transport ({diagram.transport.length})</summary>
          <div className="goods-flow-page__transport"><table className="goods-flow-page__table">
            <thead><tr><th>From</th><th>To</th><th>Net units/week</th><th>Gross forward</th><th>Gross reverse</th></tr></thead>
            <tbody>{diagram.transport.map((link) => <tr key={`${link.source}:${link.target}`}>
              {[link.source, link.target].map((id) => <td key={id}><a href={diagram.allNodes.get(id)!.path} onClick={(event) => follow(event, diagram.allNodes.get(id)!.path)}>{diagram.allNodes.get(id)!.label}</a></td>)}
              <td>{rate(link.value)}</td><td>{rate(link.forward)}</td><td>{rate(link.reverse)}</td>
            </tr>)}</tbody>
          </table></div>
        </details>}
      </>}
    </section>
  );
}
