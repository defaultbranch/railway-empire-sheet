import { useCities } from '../game-state/city-state';
import { citySlug } from './city-routes';

export function CityPage({ slug }: { slug: string }) {
  const { cities, setCityPopulation } = useCities();
  const city = cities.find((existing) => citySlug(existing) === slug);

  if (city === undefined) {
    return (
      <section className="city-page">
        <p className="city-page__empty">No city found for "{slug}".</p>
      </section>
    );
  }

  return (
    <section className="city-page">
      <h1>{city.name}</h1>
      <label className="city-page__population">
        Population
        <input
          type="number"
          min={0}
          value={city.population}
          onChange={(event) => setCityPopulation(city.name, Number(event.target.value))}
        />
      </label>
    </section>
  );
}
