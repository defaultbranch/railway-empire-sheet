import { useState } from 'react';
import {
  stationTrackCounts,
  warehouseTrackCounts,
  type StationTrackCount,
  type StopHost,
  type WarehouseTrackCount,
} from '../game-state/types';
import { useCities } from '../game-state/city-state';
import { useRuralBusinesses } from '../game-state/rural-businesses-state';
import { useRuralBusinessTypes } from '../game-state/rural-business-state';
import { useTrainStations } from '../game-state/train-stations-state';
import { useWarehouses } from '../game-state/warehouses-state';
import { useNavigation } from '../navigation';
import { pathForStation } from '../entities/station-routes';
import { pathForWarehouse } from '../entities/warehouse-routes';

type StopKind = 'station' | 'warehouse';
type HostKind = StopHost['kind'];

type StopRow = {
  kind: StopKind;
  name: string;
  tracks: number;
  host: StopHost;
};

export function StationsWarehousesPage() {
  const { navigate } = useNavigation();
  const { cities } = useCities();
  const { ruralBusinesses } = useRuralBusinesses();
  const { ruralBusinessTypes } = useRuralBusinessTypes();
  const { trainStations, addTrainStation, removeTrainStation } = useTrainStations();
  const { warehouses, addWarehouse, removeWarehouse } = useWarehouses();

  const [newKind, setNewKind] = useState<StopKind>('station');
  const [newName, setNewName] = useState('');
  const [newHostKind, setNewHostKind] = useState<HostKind>('city');
  const [newCity, setNewCity] = useState('');
  const [newBusiness1, setNewBusiness1] = useState('');
  const [newBusiness2, setNewBusiness2] = useState('');
  const [newTracks, setNewTracks] = useState<number>(stationTrackCounts[0]);

  const rows: StopRow[] = [
    ...trainStations.map((station) => ({ kind: 'station' as const, ...station })),
    ...warehouses.map((warehouse) => ({ kind: 'warehouse' as const, ...warehouse })),
  ];

  // rural businesses matter to logistics for the good they produce, not their own name
  const goodForBusiness = (businessName: string) => {
    const business = ruralBusinesses.find((existing) => existing.name === businessName);
    const type = business ? ruralBusinessTypes.find((existing) => existing.name === business.typeName) : undefined;
    return type?.good ?? businessName;
  };

  const hostLabel = (host: StopHost) =>
    host.kind === 'city' ? host.city : host.ruralBusinesses.map(goodForBusiness).join(', ');

  const trackOptions: readonly number[] = newKind === 'station' ? stationTrackCounts : warehouseTrackCounts;

  const canAdd =
    newName.trim() !== '' && (newHostKind === 'city' ? newCity !== '' : newBusiness1 !== '');

  const handleAdd = () => {
    const name = newName.trim();
    if (!canAdd) return;
    const host: StopHost =
      newHostKind === 'city'
        ? { kind: 'city', city: newCity }
        : { kind: 'ruralBusinesses', ruralBusinesses: newBusiness2 !== '' ? [newBusiness1, newBusiness2] : [newBusiness1] };

    if (newKind === 'station') {
      addTrainStation({ name, tracks: newTracks as StationTrackCount, host });
    } else {
      addWarehouse({ name, tracks: newTracks as WarehouseTrackCount, host, goods: [] });
    }

    setNewName('');
    setNewCity('');
    setNewBusiness1('');
    setNewBusiness2('');
  };

  const handleRemove = (row: StopRow) => {
    if (row.kind === 'station') removeTrainStation(row.name);
    else removeWarehouse(row.name);
  };

  const handleKindChange = (kind: StopKind) => {
    setNewKind(kind);
    setNewTracks(kind === 'station' ? stationTrackCounts[0] : warehouseTrackCounts[0]);
  };

  return (
    <div className="stations-warehouses-page">
      <table className="stations-warehouses-page__table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Kind</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={3} className="stations-warehouses-page__empty">
                No stations or warehouses yet.
              </td>
            </tr>
          )}
          {rows.map((row) => (
            <tr key={`${row.kind}-${row.name}`}>
              <td>
                {row.kind === 'station' ? (
                  <a
                    href={pathForStation(row)}
                    onClick={(event) => {
                      event.preventDefault();
                      navigate(pathForStation(row));
                    }}
                  >
                    {row.name}
                  </a>
                ) : (
                  <a
                    href={pathForWarehouse(row)}
                    onClick={(event) => {
                      event.preventDefault();
                      navigate(pathForWarehouse(row));
                    }}
                  >
                    {row.name}
                  </a>
                )}{' '}
                ({hostLabel(row.host)})
              </td>
              <td>
                {row.kind === 'station' ? 'Station' : 'Warehouse'} ({row.tracks} tracks)
              </td>
              <td>
                <button type="button" onClick={() => handleRemove(row)} aria-label={`Remove ${row.name}`}>
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <form
        className="stations-warehouses-page__add"
        onSubmit={(event) => {
          event.preventDefault();
          handleAdd();
        }}
      >
        <select value={newKind} onChange={(event) => handleKindChange(event.target.value as StopKind)}>
          <option value="station">Station</option>
          <option value="warehouse">Warehouse</option>
        </select>
        <input type="text" value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Name" />
        <select value={newHostKind} onChange={(event) => setNewHostKind(event.target.value as HostKind)}>
          <option value="city">City</option>
          <option value="ruralBusinesses">Rural business</option>
        </select>
        {newHostKind === 'city' ? (
          <select value={newCity} onChange={(event) => setNewCity(event.target.value)}>
            <option value="">Select city…</option>
            {cities.map((city) => (
              <option key={city.name} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
        ) : (
          <>
            <select value={newBusiness1} onChange={(event) => setNewBusiness1(event.target.value)}>
              <option value="">Select rural business…</option>
              {ruralBusinesses.map((business) => (
                <option key={business.name} value={business.name}>
                  {business.name}
                </option>
              ))}
            </select>
            {newBusiness1 !== '' && (
              <select value={newBusiness2} onChange={(event) => setNewBusiness2(event.target.value)}>
                <option value="">Second rural business (optional)…</option>
                {ruralBusinesses
                  .filter((business) => business.name !== newBusiness1)
                  .map((business) => (
                    <option key={business.name} value={business.name}>
                      {business.name}
                    </option>
                  ))}
              </select>
            )}
          </>
        )}
        <select value={newTracks} onChange={(event) => setNewTracks(Number(event.target.value))}>
          {trackOptions.map((tracks) => (
            <option key={tracks} value={tracks}>
              {tracks}
            </option>
          ))}
        </select>
        <button type="submit" disabled={!canAdd}>
          Add
        </button>
      </form>
      {cities.length === 0 && ruralBusinesses.length === 0 && (
        <p className="stations-warehouses-page__hint">Add a city or rural business on a previous page first.</p>
      )}
    </div>
  );
}
