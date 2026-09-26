import { useWarehouses } from '../game-state/warehouses-state';
import { useCities } from '../game-state/city-state';
import { useRuralBusinesses } from '../game-state/rural-businesses-state';
import { useNavigation } from '../navigation';
import { warehouseSlug } from './warehouse-routes';
import { pathForCity } from './city-routes';
import { pathForRuralBusiness } from './rural-business-routes';

export function WarehousePage({ slug }: { slug: string }) {
  const { warehouses } = useWarehouses();
  const { cities } = useCities();
  const { ruralBusinesses } = useRuralBusinesses();
  const { navigate } = useNavigation();
  const warehouse = warehouses.find((existing) => warehouseSlug(existing) === slug);

  if (warehouse === undefined) {
    return (
      <section className="warehouse-page">
        <p className="warehouse-page__empty">No warehouse found for "{slug}".</p>
      </section>
    );
  }

  const hostCity =
    warehouse.host.kind === 'city' ? cities.find((city) => city.name === warehouse.host.city) : undefined;
  const hostBusinesses =
    warehouse.host.kind === 'ruralBusinesses'
      ? warehouse.host.ruralBusinesses
          .map((name) => ruralBusinesses.find((business) => business.name === name))
          .filter((business) => business !== undefined)
      : [];

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
    </section>
  );
}
