import { useEffect, useState, type MouseEvent } from 'react';
import { useGoods } from '../game-state/goods-state';
import { useNavigation } from '../navigation';
import { useGoodsFlow } from '../solver';
import { buildGoodsFlowDiagram, type FlowDiagramNode } from './goods-flow';
import { flowNodeLabelOffset, layoutGoodsFlow } from './goods-flow-layout';

const rate = (amount: number) => amount.toLocaleString(undefined, { maximumFractionDigits: 2 });
const percentage = (node: FlowDiagramNode) => node.requested > 0
  ? `${rate(100 * node.served / node.requested)}%` : '\u2014';
const goodFromUrl = () => new URLSearchParams(window.location.search).get('good') ?? '';

function FlowSankey({ diagram, good, follow }: {
  diagram: ReturnType<typeof buildGoodsFlowDiagram>;
  good: string;
  follow: (event: MouseEvent<HTMLElement | SVGElement>, path: string) => void;
}) {
  if (diagram.links.length === 0) return <p className="goods-flow-page__empty">No realized flow for {good}.</p>;
  const producerCount = diagram.nodes.filter((node) => node.role === 'producer').length;
  const consumerCount = diagram.nodes.filter((node) => node.role === 'consumer').length;
  const stopCount = diagram.nodes.length - producerCount - consumerCount;
  const height = Math.max(360, Math.max(producerCount, consumerCount, stopCount) * 64 + 120);
  const graph = layoutGoodsFlow(diagram.nodes, diagram.links, height);
  const bounds = graph.nodes.flatMap((node) => [node.x0, node.x1]);
  const width = Math.max(1400, ...bounds.map((bound) => bound + 120));
  return (
    <div className="goods-flow-page__diagram" role="region" aria-label={`${good} flow diagram`} tabIndex={0}>
      <svg width={width} height={graph.height} viewBox={`0 ${graph.top} ${width} ${graph.height}`} role="img" aria-label={`${good} net flow in units per week`}>
        <title>{good} net flow in units per week</title>
        {graph.links.map((link, index) => (
          <path key={index} d={link.path} strokeWidth={Math.max(1, link.width)} className={`goods-flow-page__ribbon goods-flow-page__ribbon--${link.source.role}`}>
            <title>{`${link.source.label} → ${link.target.label}: ${rate(link.value)} units/week\nGross forward: ${rate(link.forward)}; reverse: ${rate(link.reverse)} units/week`}</title>
          </path>
        ))}
        {graph.nodes.map((node) => (
          <a key={node.id} href={node.path} onClick={(event) => follow(event, node.path)} className={`goods-flow-page__node goods-flow-page__node--${node.role}`}>
            <title>{`${node.label}\n${node.role}\n${rate(node.served)} units/week${node.role === 'producer' ? `; utilization ${percentage(node)}` : node.role === 'consumer' ? `; satisfaction ${percentage(node)}` : ''}`}</title>
            <rect x={node.x0} y={node.y0} width={node.x1 - node.x0} height={Math.max(2, node.y1 - node.y0)} />
            <foreignObject x={(node.x0 + node.x1) / 2 - 105} y={node.y0 - flowNodeLabelOffset} width={210} height={46}>
              <div className="goods-flow-page__node-label">
                <strong>{node.label}</strong>
                <span>{rate(node.role === 'consumer' ? node.served : Math.max(node.served, node.requested))} units/week{node.role === 'producer' || node.role === 'consumer' ? ` · ${percentage(node)}` : ''}</span>
              </div>
            </foreignObject>
          </a>
        ))}
      </svg>
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