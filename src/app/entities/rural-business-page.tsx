import { useRuralBusinesses } from '../game-state/rural-businesses-state';
import { useTrainStations } from '../game-state/train-stations-state';
import { useWarehouses } from '../game-state/warehouses-state';
import { useNavigation } from '../navigation';
import { ruralBusinessSlug } from './rural-business-routes';
import { pathForStation } from './station-routes';
import { pathForWarehouse } from './warehouse-routes';
import type { StopHost } from '../game-state/types';

const hostsBusiness = (host: StopHost, businessName: string): boolean =>
  host.kind === 'ruralBusinesses' && host.ruralBusinesses.includes(businessName);

export function RuralBusinessPage({ slug }: { slug: string }) {
  const { ruralBusinesses } = useRuralBusinesses();
  const { trainStations } = useTrainStations();
  const { warehouses } = useWarehouses();
  const { navigate } = useNavigation();
  const business = ruralBusinesses.find((existing) => ruralBusinessSlug(existing) === slug);

  if (business === undefined) {
    return (
      <section className="rural-business-page">
        <p className="rural-business-page__empty">No rural business found for "{slug}".</p>
      </section>
    );
  }

  const connectedStations = trainStations.filter((station) => hostsBusiness(station.host, business.name));
  const connectedWarehouses = warehouses.filter((warehouse) => hostsBusiness(warehouse.host, business.name));

  return (
    <section className="rural-business-page">
      <h1>{business.name}</h1>
      <p className="rural-business-page__type">Type: {business.typeName}</p>
      <p className="rural-business-page__level">Level: {business.level}</p>
      <section className="rural-business-page__connections">
        <h2>Stations</h2>
        {connectedStations.length === 0 ? (
          <p className="rural-business-page__empty">No connected stations.</p>
        ) : (
          <ul>
            {connectedStations.map((station) => (
              <li key={station.name}>
                <a
                  href={pathForStation(station)}
                  onClick={(event) => {
                    event.preventDefault();
                    navigate(pathForStation(station));
                  }}
                >
                  {station.name}
                </a>
              </li>
            ))}
          </ul>
        )}
        <h2>Warehouses</h2>
        {connectedWarehouses.length === 0 ? (
          <p className="rural-business-page__empty">No connected warehouses.</p>
        ) : (
          <ul>
            {connectedWarehouses.map((warehouse) => (
              <li key={warehouse.name}>
                <a
                  href={pathForWarehouse(warehouse)}
                  onClick={(event) => {
                    event.preventDefault();
                    navigate(pathForWarehouse(warehouse));
                  }}
                >
                  {warehouse.name}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
