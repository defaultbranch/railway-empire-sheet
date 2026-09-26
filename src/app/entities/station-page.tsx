import { useTrainStations } from '../game-state/train-stations-state';
import { useCities } from '../game-state/city-state';
import { useRuralBusinesses } from '../game-state/rural-businesses-state';
import { useNavigation } from '../navigation';
import { stationSlug } from './station-routes';
import { pathForCity } from './city-routes';
import { pathForRuralBusiness } from './rural-business-routes';

export function StationPage({ slug }: { slug: string }) {
  const { trainStations } = useTrainStations();
  const { cities } = useCities();
  const { ruralBusinesses } = useRuralBusinesses();
  const { navigate } = useNavigation();
  const station = trainStations.find((existing) => stationSlug(existing) === slug);

  if (station === undefined) {
    return (
      <section className="station-page">
        <p className="station-page__empty">No station found for "{slug}".</p>
      </section>
    );
  }

  const hostCity = station.host.kind === 'city' ? cities.find((city) => city.name === station.host.city) : undefined;
  const hostBusinesses =
    station.host.kind === 'ruralBusinesses'
      ? station.host.ruralBusinesses
          .map((name) => ruralBusinesses.find((business) => business.name === name))
          .filter((business) => business !== undefined)
      : [];

  return (
    <section className="station-page">
      <h1>{station.name}</h1>
      <p className="station-page__tracks">Tracks: {station.tracks}</p>
      <section className="station-page__connections">
        <h2>Connects to</h2>
        {hostCity !== undefined && (
          <a
            href={pathForCity(hostCity)}
            onClick={(event) => {
              event.preventDefault();
              navigate(pathForCity(hostCity));
            }}
          >
            {hostCity.name}
          </a>
        )}
        {hostBusinesses.length > 0 && (
          <ul>
            {hostBusinesses.map((business) => (
              <li key={business.name}>
                <a
                  href={pathForRuralBusiness(business)}
                  onClick={(event) => {
                    event.preventDefault();
                    navigate(pathForRuralBusiness(business));
                  }}
                >
                  {business.name}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
