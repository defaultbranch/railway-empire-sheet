import { useEffect, useState, type MouseEvent } from 'react';
import { useCities } from '../game-state/city-state';
import { useIndustries } from '../game-state/industries-state';
import { industrySlots } from '../game-state/types';
import { useNavigation } from '../navigation';
import { useGoodsFlow } from '../solver';
import { buildIndustryFlowDiagram } from './goods-flow';
import { FlowSankey } from './goods-flow-page';

function selectionFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return { city: params.get('city') ?? '', slot: params.get('slot') ?? '1' };
}

export function IndustryFlowPage() {
  const { cities } = useCities();
  const { industries } = useIndustries();
  const { network, solution, droppedLines } = useGoodsFlow();
  const { navigate } = useNavigation();
  const [selection, setSelection] = useState(selectionFromUrl);
  useEffect(() => {
    const onPopState = () => setSelection(selectionFromUrl());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  const choose = (city: string, slot: string) => {
    const url = new URL(window.location.href);
    if (city === '') url.searchParams.delete('city');
    else url.searchParams.set('city', city);
    url.searchParams.set('slot', slot);
    window.history.pushState(null, '', `${url.pathname}${url.search}${url.hash}`);
    setSelection({ city, slot });
  };
  const follow = (event: MouseEvent<HTMLElement | SVGElement>, path: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(path);
  };
  const validCity = cities.some((city) => city.name === selection.city);
  const industry = validCity ? industries.find((entry) =>
    entry.city === selection.city && String(entry.citySlot + 1) === selection.slot) : undefined;
  const modeled = industry !== undefined && network.nodes.some((node) => node.conversions.some((conversion) =>
    conversion.contributor.kind === 'industry' && conversion.contributor.city === industry.city
    && conversion.contributor.slot === industry.citySlot));

  return (
    <section className="goods-flow-page industry-flow-page">
      <div className="industry-flow-page__selectors">
        <label className="goods-flow-page__selector" htmlFor="industry-flow-city">City
          <select id="industry-flow-city" value={selection.city} onChange={(event) => {
            const first = industries.find((entry) => entry.city === event.target.value);
            choose(event.target.value, String((first?.citySlot ?? 0) + 1));
          }}>
            <option value="">Select city...</option>
            {selection.city !== '' && !validCity && <option value={selection.city}>{selection.city} (unavailable)</option>}
            {cities.map((city) => <option key={city.name} value={city.name}>{city.name}</option>)}
          </select>
        </label>
        <label className="goods-flow-page__selector" htmlFor="industry-flow-slot">Industry slot
          <select id="industry-flow-slot" value={selection.slot} disabled={!validCity}
            onChange={(event) => choose(selection.city, event.target.value)}>
            {!industrySlots.some((slot) => String(slot + 1) === selection.slot)
              && <option value={selection.slot}>{selection.slot} (unavailable)</option>}
            {industrySlots.map((slot) => {
              const assigned = industries.find((entry) => entry.city === selection.city && entry.citySlot === slot);
              return <option key={slot} value={String(slot + 1)}>
                {slot + 1}: {assigned?.typeName ?? 'Empty'}
              </option>;
            })}
          </select>
        </label>
      </div>
      {selection.city === '' ? <p className="goods-flow-page__empty">No city selected.</p>
        : !validCity ? <p className="goods-flow-page__empty">This city is no longer registered.</p>
        : industry === undefined ? <p className="goods-flow-page__empty">No industry in this slot.</p>
        : <>
          <h2>{industry.typeName} <small>Level {industry.level}</small></h2>
          {!solution.converged && <p role="status">The solver did not converge after {solution.iterations} iterations. Flows are estimates.</p>}
          {!modeled && <p role="status">This industry is not in the modeled network. Check its connected stops and production figures.</p>}
          {solution.missingCoefficients.length > 0 && <p role="status">{solution.missingCoefficients.length} missing production figures; affected entities are excluded.</p>}
          {droppedLines.length > 0 && <details><summary>{droppedLines.length} excluded train lines</summary>
            <ul>{droppedLines.map((line) => <li key={line.line}>{line.line}: {line.reason}</li>)}</ul>
          </details>}
          {(['in', 'out'] as const).map((direction) => {
            const title = direction === 'in' ? 'Inflowing resources' : 'Outflowing products';
            const diagram = buildIndustryFlowDiagram(network, solution,
              { kind: 'industry', city: industry.city, slot: industry.citySlot }, direction);
            return <section key={direction} aria-label={title} className="industry-flow-page__flow">
              <h3>{title}</h3>
              <FlowSankey diagram={diagram} good={`${industry.city} slot ${industry.citySlot + 1}: ${title.toLowerCase()}`}
                follow={follow} showGross={false} />
            </section>;
          })}
        </>}
    </section>
  );
}
