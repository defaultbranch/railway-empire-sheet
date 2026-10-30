import { useEffect, useState } from 'react';
import { useDemands } from '../game-state/demands-state';
import { useCities } from '../game-state/city-state';
import { useGoods } from '../game-state/goods-state';
import { useIndustryTypes } from '../game-state/industry-state';
import { useTrainStations } from '../game-state/train-stations-state';
import { useWarehouses } from '../game-state/warehouses-state';
import { totalDemandForCity, totalDemandAcrossCities } from './total-demand';

function cityFromUrl(): string {
  return new URLSearchParams(window.location.search).get('city') ?? '';
}

export function TotalDemandInReachPage() {
  const { demands } = useDemands();
  const { cities } = useCities();
  const { goods } = useGoods();
  const { industryTypes } = useIndustryTypes();
  const { trainStations } = useTrainStations();
  const { warehouses } = useWarehouses();
  const [selectedCity, setSelectedCity] = useState(cityFromUrl);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (selectedCity === '') {
      params.delete('city');
    } else {
      params.set('city', selectedCity);
    }
    const query = params.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${query === '' ? '' : `?${query}`}`);
  }, [selectedCity]);

  useEffect(() => {
    const onPopState = () => setSelectedCity(cityFromUrl());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const city = cities.find((existing) => existing.name === selectedCity);
  const reachableCityNames = new Set([
    ...trainStations.flatMap((station) => (station.host.kind === 'city' ? [station.host.city] : [])),
    ...warehouses.flatMap((warehouse) => (warehouse.host.kind === 'city' ? [warehouse.host.city] : [])),
  ]);
  const reachableCities = cities.filter((existing) => reachableCityNames.has(existing.name));

  const cityTotals = city === undefined ? undefined : totalDemandForCity(demands, city, industryTypes);
  const allCitiesTotals = totalDemandAcrossCities(demands, cities, industryTypes);
  const reachTotals = totalDemandAcrossCities(demands, reachableCities, industryTypes);

  return (
    <div className="total-demand-page">
      <table className="total-demand-page__table">
        <thead>
          <tr>
            <th>Good</th>
            <th>Global demand (wagons/week)</th>
            <th>Demand in reach (wagons/week)</th>
            <th>
              <label className="total-demand-page__city-select">
                Demand in
                <select value={selectedCity} onChange={(event) => setSelectedCity(event.target.value)}>
                  <option value="">Select city…</option>
                  {cities.map((existing) => (
                    <option key={existing.name} value={existing.name}>
                      {existing.name}
                    </option>
                  ))}
                </select>
                (wagons/week)
              </label>
            </th>
          </tr>
        </thead>
        <tbody>
          {goods.length === 0 && (
            <tr>
              <td colSpan={4} className="total-demand-page__empty">
                No goods yet.
              </td>
            </tr>
          )}
          {goods.map((good) => (
            <tr key={good}>
              <td>{good}</td>
              <td>{(allCitiesTotals.get(good) ?? 0).toFixed(2)}</td>
              <td>{(reachTotals.get(good) ?? 0).toFixed(2)}</td>
              <td>{cityTotals === undefined ? '—' : (cityTotals.get(good) ?? 0).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {cities.length === 0 && <p className="total-demand-page__hint">Add a city on an earlier page first.</p>}
    </div>
  );
}
