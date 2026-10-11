import { useState } from 'react';
import { useCities } from '../game-state/city-state';
import { useGoods } from '../game-state/goods-state';
import { useGoodsFlow } from '../solver';

export function CityGoodBalancePage() {
  const { cities } = useCities();
  const { goods } = useGoods();
  const { solution } = useGoodsFlow();
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedGood, setSelectedGood] = useState('');

  const supplied = solution.contributorFlows
    .filter(
      (flow) =>
        flow.contributor.kind === 'population' &&
        flow.contributor.city === selectedCity &&
        flow.good === selectedGood,
    )
    .reduce((total, flow) => total + flow.served, 0);

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
        <span className="city-good-balance-page__label">Population demand supplied</span>
        <output className="city-good-balance-page__value" aria-live="polite">
          {selectedCity === '' || selectedGood === '' ? '—' : `${supplied.toFixed(2)} wagons/week`}
        </output>
      </div>
    </div>
  );
}
