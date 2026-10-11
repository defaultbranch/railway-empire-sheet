import { useEffect, useState } from 'react';
import { useCities } from '../game-state/city-state';
import { useGoods } from '../game-state/goods-state';
import { useGoodsFlow } from '../solver';
import { suppliedToCityForGood } from './city-good-balance';

function selectionsFromUrl(): { city: string; good: string } {
  const params = new URLSearchParams(window.location.search);
  return { city: params.get('city') ?? '', good: params.get('good') ?? '' };
}

export function CityGoodBalancePage() {
  const { cities } = useCities();
  const { goods } = useGoods();
  const { network, solution } = useGoodsFlow();
  const [initialSelections] = useState(selectionsFromUrl);
  const [selectedCity, setSelectedCity] = useState(initialSelections.city);
  const [selectedGood, setSelectedGood] = useState(initialSelections.good);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (selectedCity === '') params.delete('city');
    else params.set('city', selectedCity);
    if (selectedGood === '') params.delete('good');
    else params.set('good', selectedGood);
    const query = params.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${query === '' ? '' : `?${query}`}`);
  }, [selectedCity, selectedGood]);

  useEffect(() => {
    const onPopState = () => {
      const selections = selectionsFromUrl();
      setSelectedCity(selections.city);
      setSelectedGood(selections.good);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const supplied = suppliedToCityForGood(network, solution, selectedCity, selectedGood);

  return (
    <div className="city-good-balance-page">
      <div className="city-good-balance-page__selectors">
        <label htmlFor="city-good-balance-city">
          City
          <select
            id="city-good-balance-city"
            value={selectedCity}
            onChange={(event) => setSelectedCity(event.target.value)}
          >
            <option value="">Select city...</option>
            {cities.map((city) => (
              <option key={city.name} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="city-good-balance-good">
          Good
          <select
            id="city-good-balance-good"
            value={selectedGood}
            onChange={(event) => setSelectedGood(event.target.value)}
          >
            <option value="">Select good...</option>
            {goods.map((good) => (
              <option key={good} value={good}>
                {good}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="city-good-balance-page__result">
        <span className="city-good-balance-page__label">Population and industry demand supplied</span>
        <output className="city-good-balance-page__value" aria-live="polite">
          {selectedCity === '' || selectedGood === '' ? '—' : `${supplied.toFixed(2)} wagons/week`}
        </output>
      </div>
    </div>
  );
}
