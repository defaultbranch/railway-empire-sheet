import type { MouseEvent } from 'react';
import { pathForCity } from '../entities/city-routes';
import { pathForGood } from '../entities/good-routes';
import { useCities } from '../game-state/city-state';
import { useDemands } from '../game-state/demands-state';
import { useNavigation } from '../navigation';
import { useGoodsFlow } from '../solver';
import { analyzePopulationSupply } from './analytics';

export function AnalyticsPage() {
  const { cities } = useCities();
  const { demands } = useDemands();
  const { solution, droppedLines } = useGoodsFlow();
  const { navigate } = useNavigation();
  const warnings = analyzePopulationSupply(cities, demands, solution);
  const affectedCities = new Set(warnings.map((warning) => warning.city)).size;
  const incomplete = !solution.converged || solution.missingCoefficients.length > 0 || droppedLines.length > 0;
  const follow = (event: MouseEvent<HTMLAnchorElement>, path: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(path);
  };

  return (
    <section className="analytics-page" aria-label="Population supply analytics">
      <h2>Missing Population Supply</h2>
      {!solution.converged && <p role="status">The solver did not converge after {solution.iterations} iterations. Supply warnings are provisional.</p>}
      {solution.missingCoefficients.length > 0 && <p role="status">{solution.missingCoefficients.length} missing production figures; affected production is excluded from the supply estimate.</p>}
      {droppedLines.length > 0 && <details>
        <summary>{droppedLines.length} excluded train lines</summary>
        <ul>{droppedLines.map((line) => <li key={line.line}>{line.line}: {line.reason}</li>)}</ul>
      </details>}
      {cities.length === 0 ? <p className="analytics-page__empty">No cities registered.</p>
        : !demands.some((demand) => demand.wagonsPerMillion > 0)
          ? <p className="analytics-page__empty">No population demand configured.</p>
          : warnings.length === 0
            ? <p role="status">{incomplete ? 'No completely missing population supplies found in the current estimate.' : 'No completely missing population supplies.'}</p>
            : <>
              <p role="status">{warnings.length} {warnings.length === 1 ? 'warning' : 'warnings'} across {affectedCities} {affectedCities === 1 ? 'city' : 'cities'}.</p>
              <div className="analytics-page__results">
                <table className="analytics-page__table">
                  <thead><tr>
                    <th scope="col">Priority</th>
                    <th scope="col">City</th>
                    <th scope="col">Missing Good</th>
                    <th scope="col">Unlock Population</th>
                    <th scope="col">Unmet Demand (wagons/week)</th>
                  </tr></thead>
                  <tbody>{warnings.map((warning) => {
                    const cityPath = pathForCity({ name: warning.city });
                    const goodPath = pathForGood(warning.good);
                    return <tr key={JSON.stringify([warning.city, warning.good])}>
                      <td><strong className={warning.minPopulation === 0 ? 'analytics-page__essential' : undefined}>
                        {warning.priority}{warning.minPopulation === 0 ? ' - Essential' : ''}
                      </strong></td>
                      <td><a href={cityPath} onClick={(event) => follow(event, cityPath)}>{warning.city}</a></td>
                      <td><a href={goodPath} onClick={(event) => follow(event, goodPath)}>{warning.good}</a></td>
                      <td>{warning.minPopulation.toLocaleString()}</td>
                      <td>{warning.demand.toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
                    </tr>;
                  })}</tbody>
                </table>
              </div>
            </>}
    </section>
  );
}