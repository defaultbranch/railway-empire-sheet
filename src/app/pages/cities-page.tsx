import { useState } from 'react';
import { useCities } from '../game-state/city-state';
import { useNavigation } from '../navigation';
import { pathForCity } from '../entities/city-routes';

export function CitiesPage() {
  const { cities, addCity, removeCity, setCityPopulation } = useCities();
  const { navigate } = useNavigation();
  const [newCity, setNewCity] = useState('');

  const handleAdd = () => {
    const trimmed = newCity.trim();
    if (trimmed === '') return;
    addCity(trimmed);
    setNewCity('');
  };

  return (
    <div className="cities-page">
      <table className="cities-page__table">
        <thead>
          <tr>
            <th>City</th>
            <th>Population</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {cities.length === 0 && (
            <tr>
              <td colSpan={3} className="cities-page__empty">
                No cities yet.
              </td>
            </tr>
          )}
          {cities.map((city) => (
            <tr key={city.name}>
              <td>
                <a
                  href={pathForCity(city)}
                  onClick={(event) => {
                    event.preventDefault();
                    navigate(pathForCity(city));
                  }}
                >
                  {city.name}
                </a>
              </td>
              <td>
                <input
                  type="number"
                  min={0}
                  value={city.population}
                  onChange={(event) => setCityPopulation(city.name, Number(event.target.value))}
                />
              </td>
              <td>
                <button type="button" onClick={() => removeCity(city.name)} aria-label={`Remove ${city.name}`}>
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <form
        className="cities-page__add"
        onSubmit={(event) => {
          event.preventDefault();
          handleAdd();
        }}
      >
        <input
          type="text"
          value={newCity}
          onChange={(event) => setNewCity(event.target.value)}
          placeholder="New city name"
        />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}
