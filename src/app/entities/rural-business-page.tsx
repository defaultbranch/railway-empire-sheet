import { useState } from 'react';
import {
  businessLevels,
  stationTrackCounts,
  warehouseTrackCounts,
  type BusinessLevel,
  type StationTrackCount,
  type StopHost,
  type WarehouseTrackCount,
} from '../game-state/types';
import { useRuralBusinesses } from '../game-state/rural-businesses-state';
import { useTrainStations } from '../game-state/train-stations-state';
import { useWarehouses } from '../game-state/warehouses-state';
import { useNavigation } from '../navigation';
import { ruralBusinessSlug } from './rural-business-routes';
import { pathForStation } from './station-routes';
import { pathForWarehouse } from './warehouse-routes';

const hostsBusiness = (host: StopHost, businessName: string): boolean =>
  host.kind === 'ruralBusinesses' && host.ruralBusinesses.includes(businessName);

export function RuralBusinessPage({ slug }: { slug: string }) {
  const { ruralBusinesses, setRuralBusinessLevel } = useRuralBusinesses();
  const { trainStations, addTrainStation } = useTrainStations();
  const { warehouses, addWarehouse } = useWarehouses();
  const { navigate } = useNavigation();
  const [newStopKind, setNewStopKind] = useState<'station' | 'warehouse'>('station');
  const [newStopName, setNewStopName] = useState('');
  const [newStopTracks, setNewStopTracks] = useState<number>(stationTrackCounts[0]);
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
  const trimmedStopName = newStopName.trim();
  const existingStopNames = newStopKind === 'station'
    ? trainStations.map((station) => station.name)
    : warehouses.map((warehouse) => warehouse.name);
  const canAddStop = trimmedStopName !== '' && !existingStopNames.includes(trimmedStopName);

  const handleStopKindChange = (kind: 'station' | 'warehouse') => {
    setNewStopKind(kind);
    setNewStopTracks(kind === 'station' ? stationTrackCounts[0] : warehouseTrackCounts[0]);
  };

  const addStop = () => {
    if (!canAddStop) return;
    const host: StopHost = { kind: 'ruralBusinesses', ruralBusinesses: [business.name] };
    if (newStopKind === 'station') {
      addTrainStation({ name: trimmedStopName, tracks: newStopTracks as StationTrackCount, host });
    } else {
      addWarehouse({ name: trimmedStopName, tracks: newStopTracks as WarehouseTrackCount, host, goods: [] });
    }
    setNewStopName('');
  };

  return (
    <section className="rural-business-page">
      <h1>{business.name}</h1>
      <p className="rural-business-page__type">Type: {business.typeName}</p>
      <label className="rural-business-page__level">
        Level
        <select
          value={business.level}
          onChange={(event) =>
            setRuralBusinessLevel(business.name, Number(event.target.value) as BusinessLevel)
          }
        >
          {businessLevels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </label>
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
        <form
          className="rural-business-page__add"
          onSubmit={(event) => {
            event.preventDefault();
            addStop();
          }}
        >
          <input
            type="text"
            value={newStopName}
            onChange={(event) => setNewStopName(event.target.value)}
            placeholder="New station or warehouse name"
            aria-label="New station or warehouse name"
          />
          <select
            value={newStopKind}
            onChange={(event) => handleStopKindChange(event.target.value as 'station' | 'warehouse')}
            aria-label="Connection type"
          >
            <option value="station">Station</option>
            <option value="warehouse">Warehouse</option>
          </select>
          <select
            value={newStopTracks}
            onChange={(event) => setNewStopTracks(Number(event.target.value))}
            aria-label="Track count"
          >
            {(newStopKind === 'station' ? stationTrackCounts : warehouseTrackCounts).map((tracks) => (
              <option key={tracks} value={tracks}>
                {tracks} tracks
              </option>
            ))}
          </select>
          <button type="submit" disabled={!canAddStop}>
            Add
          </button>
        </form>
      </section>
    </section>
  );
}
