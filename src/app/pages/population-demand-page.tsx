import { useEffect, useState } from 'react';
import { useDemands } from '../game-state/demands-state';
import { useCities } from '../game-state/city-state';
import { demandForCity, totalDemand } from './population-demand';

function cityFromUrl(): string {
  return new URLSearchParams(window.location.search).get('city') ?? '';
}

export function PopulationDemandPage() {
  const { demands } = useDemands();
  const { cities } = useCities();
  const [selectedCity, setSelectedCity] = useState(cityFromUrl);

  // keep the ?city= query parameter in sync with the selection, without adding history entries
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

  return (
    <div className="population-demand-page">
      <table className="population-demand-page__table">
        <thead>
          <tr>
            <th>Good</th>
            <th>
              <label className="population-demand-page__city-select">
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
            <th>Demand across all cities (wagons/week)</th>
          </tr>
        </thead>
        <tbody>
          {demands.length === 0 && (
            <tr>
              <td colSpan={3} className="population-demand-page__empty">
                No demands yet.
              </td>
            </tr>
          )}
          {demands.map((demand) => (
            <tr key={demand.good}>
              <td>{demand.good}</td>
              <td>{city === undefined ? '—' : demandForCity(demand, city).toFixed(2)}</td>
              <td>{totalDemand(demand, cities).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {cities.length === 0 && <p className="population-demand-page__hint">Add a city on an earlier page first.</p>}
    </div>
  );
}
