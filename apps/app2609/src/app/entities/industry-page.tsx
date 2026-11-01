import { useEffect, type MouseEvent } from 'react';
import { businessLevels, type BusinessLevel, type GoodFlow } from '../game-state/types';
import { useIndustries } from '../game-state/industries-state';
import { useIndustryTypes } from '../game-state/industry-state';
import { useNavigation } from '../navigation';
import { NavigatableHeading } from '../navigatable-heading';
import { industrySlug, pathForIndustry } from './industry-routes';
import { pathForIndustryType } from './industry-type-routes';
import { pathForCity } from './city-routes';
import { useGoodsFlow } from '../solver';
import { buildIndustryFlowDiagram } from '../pages/goods-flow';
import { FlowSankey } from '../pages/flow-sankey';

export function IndustryPage({ slug }: { slug: string }) {
  const { industries, setIndustryLevel } = useIndustries();
  const { industryTypes } = useIndustryTypes();
  const { navigate } = useNavigation();
  const { network, solution, droppedLines } = useGoodsFlow();
  const industry = industries.find((entry) => industrySlug(entry) === slug);

  useEffect(() => {
    if (industry === undefined) return;
    const previousTitle = document.title;
    document.title = `Industry: ${industry.city} [${industry.citySlot}] - ${industry.typeName}`;
    return () => { document.title = previousTitle; };
  }, [industry]);

  if (industry === undefined) {
    return <section className="industry-type-page"><p>No industry found for "{slug}".</p></section>;
  }

  const type = industryTypes.find((entry) => entry.name === industry.typeName);
  const diagram = buildIndustryFlowDiagram(network, solution,
    { kind: 'industry', city: industry.city, slot: industry.citySlot }, 'out');
  const modeled = network.nodes.some((node) => node.conversions.some((conversion) =>
    conversion.contributor.kind === 'industry' && conversion.contributor.city === industry.city
    && conversion.contributor.slot === industry.citySlot));
  const followFlow = (event: MouseEvent<HTMLElement | SVGElement>, path: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(path);
  };
  const cityPath = pathForCity({ name: industry.city });
  const typePath = pathForIndustryType({ name: industry.typeName });
  const headings = [...industries]
    .sort((left, right) => left.city.localeCompare(right.city) || left.citySlot - right.citySlot)
    .map((entry) => ({ title: `${entry.city} [${entry.citySlot}] - ${entry.typeName}`, path: pathForIndustry(entry) }));

  const renderFlows = (label: string, flows: GoodFlow[]) => (
    <section className="industry-type-page__flows">
      <h2>{label}</h2>
      {flows.length === 0 ? <p>No {label.toLowerCase()}.</p> : (
        <div className="industry-type-page__table-scroll">
          <table className="industry-type-page__table">
            <thead><tr><th>Good</th><th>Weekly amount</th></tr></thead>
            <tbody>
              {flows.map((flow, index) => (
                <tr key={index}><td>{flow.good ?? '?'}</td><td>{flow.amountByLevel[industry.level] ?? '?'}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );

  return (
    <section className="industry-type-page">
      <NavigatableHeading headings={headings} currentPath={pathForIndustry(industry)}
        onNavigate={navigate} navigationLabel="industry" />
      <p>City: <a href={cityPath} onClick={(event) => { event.preventDefault(); navigate(cityPath); }}>{industry.city}</a></p>
      <p>Slot: {industry.citySlot}</p>
      <p>Type: <a href={typePath} onClick={(event) => { event.preventDefault(); navigate(typePath); }}>{industry.typeName}</a></p>
      <label className="industry-type-page__setup-cost">
        Level
        <select value={industry.level} onChange={(event) =>
          setIndustryLevel(industry.city, industry.citySlot, Number(event.target.value) as BusinessLevel)}>
          {businessLevels.map((level) => <option key={level} value={level}>{level}</option>)}
        </select>
      </label>
      {type === undefined ? <p>No industry type found for "{industry.typeName}".</p> : (
        <>
          {renderFlows('Input goods', type.rawMaterials)}
          {renderFlows('Output goods', type.products)}
        </>
      )}
      <section aria-label="Outflowing products" className="industry-flow-page__flow">
        <h2>Outflowing products</h2>
        {!solution.converged && <p role="status">The solver did not converge after {solution.iterations} iterations. Flows are estimates.</p>}
        {!modeled && <p role="status">This industry is not in the modeled network. Check its connected stops and production figures.</p>}
        {solution.missingCoefficients.length > 0 && <p role="status">{solution.missingCoefficients.length} missing production figures; affected entities are excluded.</p>}
        {droppedLines.length > 0 && <details><summary>{droppedLines.length} excluded train lines</summary>
          <ul>{droppedLines.map((line) => <li key={line.line}>{line.line}: {line.reason}</li>)}</ul>
        </details>}
        <FlowSankey diagram={diagram} good={`${industry.city} slot ${industry.citySlot + 1}: outflowing products`}
          follow={followFlow} showGross={false} />
      </section>
    </section>
  );
}
