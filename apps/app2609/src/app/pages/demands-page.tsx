import { useState } from 'react';
import { useGoods } from '../game-state/goods-state';
import { useDemands } from '../game-state/demands-state';
import { useCities } from '../game-state/city-state';
import { useIndustries } from '../game-state/industries-state';
import { useIndustryTypes } from '../game-state/industry-state';
import { estimateDemand, industryDemandForGood } from './demand-estimation';

const formatDemand = (value: number | undefined) => value === undefined
  ? 'Unknown'
  : value.toLocaleString(undefined, { maximumFractionDigits: 4 });

function DemandEstimation() {
  const { cities } = useCities();
  const { goods } = useGoods();
  const { industries } = useIndustries();
  const { industryTypes } = useIndustryTypes();
  const { demandSamples, addDemandSample, removeDemandSample } = useDemands();
  const [cityName, setCityName] = useState('');
  const [population, setPopulation] = useState('');
  const [totals, setTotals] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');
  const city = cities.find((entry) => entry.name === cityName);
  const populationValue = Number(population);
  const rows = goods.map((good) => {
    const text = totals[good] ?? '';
    const total = Number(text);
    const industry = city === undefined ? undefined : industryDemandForGood(city.name, good, industries, industryTypes);
    const entered = text.trim() !== '';
    const error = !entered ? undefined
      : !Number.isFinite(total) || total < 0 ? 'Enter a nonnegative demand.'
      : industry === undefined ? 'Industry consumption is unknown.'
      : total < industry ? 'Total is below industry consumption.' : undefined;
    return { good, text, total, industry, entered, error };
  });
  const enteredRows = rows.filter((row) => row.entered);
  const canSave = city !== undefined && Number.isFinite(populationValue) && populationValue > 0 &&
    enteredRows.length > 0 && enteredRows.every((row) => row.error === undefined);

  return (
    <section className="demand-estimation" aria-labelledby="demand-estimation-heading">
      <h2 id="demand-estimation-heading">Demand estimation</h2>
      <form onSubmit={(event) => {
        event.preventDefault();
        if (!canSave || city === undefined) return;
        addDemandSample({
          id: crypto.randomUUID(), city: city.name, population: populationValue,
          observations: enteredRows.map((row) => ({ good: row.good, total: row.total, industry: row.industry! })),
        });
        setTotals({});
        setStatus(`Sample recorded for ${city.name}.`);
      }}>
        <div className="demand-estimation__fields">
          <label>City
            <select value={cityName} required onChange={(event) => {
              const nextCity = cities.find((entry) => entry.name === event.target.value);
              setCityName(event.target.value);
              setPopulation(nextCity === undefined ? '' : String(nextCity.population));
              setTotals({});
              setStatus('');
            }}>
              <option value="">Select city...</option>
              {[...cities].sort((left, right) => left.name.localeCompare(right.name)).map((entry) => (
                <option key={entry.name} value={entry.name}>{entry.name}</option>
              ))}
            </select>
          </label>
          <label>Current population
            <input type="number" min={1} step={1} required value={population}
              onChange={(event) => setPopulation(event.target.value)} />
          </label>
        </div>
        {city !== undefined && <>
          <div className="demand-estimation__scroll">
            <table className="demand-estimation__table">
              <thead><tr><th>Good</th><th>Total wagons/week</th><th>Industry wagons/week</th><th>Residential wagons/week</th></tr></thead>
              <tbody>{rows.map((row) => (
                <tr key={row.good}>
                  <th scope="row">{row.good}</th>
                  <td>
                    <input type="number" min={0} step="any" value={row.text} aria-label={`${row.good} total weekly demand`}
                      aria-invalid={row.error !== undefined} aria-describedby={row.error ? `demand-error-${goods.indexOf(row.good)}` : undefined}
                      onChange={(event) => setTotals((previous) => ({ ...previous, [row.good]: event.target.value }))} />
                    {row.error && <small className="demand-estimation__error" id={`demand-error-${goods.indexOf(row.good)}`}>{row.error}</small>}
                  </td>
                  <td>{formatDemand(row.industry)}</td>
                  <td>{row.entered && !row.error ? formatDemand(row.total - row.industry!) : '-'}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <button type="submit" disabled={!canSave}>Record sample</button>
        </>}
      </form>
      <p role="status">{status}</p>
      <h3>Recorded samples ({demandSamples.length})</h3>
      {demandSamples.length === 0 ? <p>No samples yet.</p> : (
        <div className="demand-estimation__scroll">
          <table className="demand-estimation__table">
            <thead><tr><th>City</th><th>Population</th><th>Good</th><th>Total</th><th>Industry</th><th>Residential</th><th /></tr></thead>
            <tbody>{demandSamples.flatMap((sample) => sample.observations.map((observation, index) => (
              <tr key={`${sample.id}-${observation.good}`}>
                <td>{sample.city}</td><td>{sample.population.toLocaleString()}</td><td>{observation.good}</td>
                <td>{formatDemand(observation.total)}</td><td>{formatDemand(observation.industry)}</td>
                <td>{formatDemand(observation.total - observation.industry)}</td>
                <td>{index === 0 && <button type="button" title="Remove sample" aria-label={`Remove sample for ${sample.city} at ${sample.population}`}
                  onClick={() => { removeDemandSample(sample.id); setStatus('Sample removed.'); }}>✕</button>}</td>
              </tr>
            )))}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function DemandsPage() {
  const { goods } = useGoods();
  const { demands, demandSamples, addDemand, removeDemand, setDemandMinPopulation, setDemandWagonsPerMillion } = useDemands();
  const [newGood, setNewGood] = useState('');
  const rows = goods.map((good) => {
    const demand = demands.find((entry) => entry.good === good);
    const minPopulation = demand?.minPopulation ?? 0;
    return {
      good, minPopulation, wagonsPerMillion: demand?.wagonsPerMillion ?? 0,
      configured: demand !== undefined,
      estimate: estimateDemand(demandSamples, good, minPopulation),
    };
  });

  const availableGoods = goods.filter((good) => !demands.some((demand) => demand.good === good));

  const handleAdd = () => {
    if (newGood === '') return;
    addDemand(newGood);
    setNewGood('');
  };

  return (
    <div className="demands-page">
      <div className="demand-estimation__scroll">
      <table className="demands-page__table">
        <thead>
          <tr>
            <th>Good</th>
            <th>Min. population</th>
            <th>Wagons/week per million</th>
            <th>Estimated wagons/week per million</th>
            <th>Eligible samples</th>
            <th />
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={7} className="demands-page__empty">
                No demands yet.
              </td>
            </tr>
          )}
          {rows.map((demand) => (
            <tr key={demand.good}>
              <td>{demand.good}</td>
              <td>
                <input
                  type="number"
                  min={0}
                  value={demand.minPopulation}
                  aria-label={`${demand.good} minimum population`}
                  onChange={(event) => {
                    addDemand(demand.good);
                    setDemandMinPopulation(demand.good, Number(event.target.value));
                  }}
                />
              </td>
              <td>
                <input
                  type="number"
                  min={0}
                  value={demand.wagonsPerMillion}
                  aria-label={`${demand.good} demand coefficient`}
                  onChange={(event) => {
                    addDemand(demand.good);
                    setDemandWagonsPerMillion(demand.good, Number(event.target.value));
                  }}
                />
              </td>
              <td aria-label={`${demand.good} estimated coefficient`}>{formatDemand(demand.estimate.wagonsPerMillion)}</td>
              <td>{demand.estimate.count}</td>
              <td>
                <button type="button" aria-label={`Apply ${demand.good} estimate`} onClick={() => {
                  addDemand(demand.good);
                  setDemandWagonsPerMillion(demand.good, demand.estimate.wagonsPerMillion);
                }}>Apply</button>
              </td>
              <td>
                <button type="button" disabled={!demand.configured} onClick={() => removeDemand(demand.good)} aria-label={`Remove ${demand.good} demand`}>
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <form
        className="demands-page__add"
        onSubmit={(event) => {
          event.preventDefault();
          handleAdd();
        }}
      >
        <select value={newGood} onChange={(event) => setNewGood(event.target.value)}>
          <option value="">Select good…</option>
          {availableGoods.map((good) => (
            <option key={good} value={good}>
              {good}
            </option>
          ))}
        </select>
        <button type="submit" disabled={availableGoods.length === 0}>
          Add
        </button>
      </form>
      {goods.length === 0 && <p className="demands-page__hint">Add a good on an earlier page first.</p>}
      <DemandEstimation />
    </div>
  );
}
