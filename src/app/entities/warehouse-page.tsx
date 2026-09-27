import { useWarehouses } from '../game-state/warehouses-state';
import { useCities } from '../game-state/city-state';
import { useRuralBusinesses } from '../game-state/rural-businesses-state';
import { useTrainLines } from '../game-state/train-lines-state';
import { useNavigation } from '../navigation';
import { warehouseSlug } from './warehouse-routes';
import { pathForCity } from './city-routes';
import { pathForRuralBusiness } from './rural-business-routes';
import { pathForTrainLine } from './train-line-routes';

export function WarehousePage({ slug }: { slug: string }) {
  const { warehouses } = useWarehouses();
  const { cities } = useCities();
  const { ruralBusinesses } = useRuralBusinesses();
  const { trainLines } = useTrainLines();
  const { navigate } = useNavigation();
  const warehouse = warehouses.find((existing) => warehouseSlug(existing) === slug);

  if (warehouse === undefined) {
    return (
      <section className="warehouse-page">
        <p className="warehouse-page__empty">No warehouse found for "{slug}".</p>
      </section>
    );
  }

  const host = warehouse.host;
  const hostCity = host.kind === 'city' ? cities.find((city) => city.name === host.city) : undefined;
  const hostBusinesses =
    host.kind === 'ruralBusinesses'
      ? host.ruralBusinesses
          .map((name) => ruralBusinesses.find((business) => business.name === name))
          .filter((business) => business !== undefined)
      : [];
  const connectingLines = trainLines.filter((line) =>
    line.stops.some((stop) => stop.kind === 'warehouse' && stop.name === warehouse.name),
  );

  return (
    <section className="warehouse-page">
      <h1>{warehouse.name}</h1>
      <p className="warehouse-page__tracks">Tracks: {warehouse.tracks}</p>
      <section className="warehouse-page__connections">
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
      <section className="warehouse-page__train-lines">
        <h2>Train lines</h2>
        {connectingLines.length === 0 ? (
          <p className="warehouse-page__train-lines-empty">No train lines connect here.</p>
        ) : (
          <ul>
            {connectingLines.map((line) => (
              <li key={line.name}>
                <a
                  href={pathForTrainLine(line)}
                  onClick={(event) => {
                    event.preventDefault();
                    navigate(pathForTrainLine(line));
                  }}
                >
                  {line.name}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
