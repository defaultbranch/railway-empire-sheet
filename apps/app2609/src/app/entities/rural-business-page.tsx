import { useState, type MouseEvent } from 'react';
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
import { pathForRuralBusinessType } from './rural-business-type-routes';
import { pathForStation } from './station-routes';
import { pathForWarehouse } from './warehouse-routes';
import { useGoodsFlow } from '../solver';
import { buildRuralBusinessFlowDiagram } from '../pages/goods-flow';
import { FlowSankey } from '../pages/goods-flow-page';

const hostsBusiness = (host: StopHost, businessName: string): boolean =>
  host.kind === 'ruralBusinesses' && host.ruralBusinesses.includes(businessName);

const hostWithBusiness = (host: StopHost, businessName: string): StopHost | undefined => {
  if (host.kind !== 'ruralBusinesses' || host.ruralBusinesses.includes(businessName) || host.ruralBusinesses.length >= 2) {
    return undefined;
  }
  return {
    kind: 'ruralBusinesses',
    ruralBusinesses: [...host.ruralBusinesses, businessName] as [string, string],
  };
};

export function RuralBusinessPage({ slug }: { slug: string }) {
  const { ruralBusinesses, setRuralBusinessLevel } = useRuralBusinesses();
  const { trainStations, addTrainStation, replaceTrainStations } = useTrainStations();
  const { warehouses, addWarehouse, replaceWarehouses } = useWarehouses();
  const { navigate } = useNavigation();
  const { network, solution, droppedLines } = useGoodsFlow();
  const [newStopKind, setNewStopKind] = useState<'station' | 'warehouse'>('station');
  const [newStopName, setNewStopName] = useState('');
  const [newStopTracks, setNewStopTracks] = useState<number>(stationTrackCounts[0]);
  const [existingStopKind, setExistingStopKind] = useState<'station' | 'warehouse'>('station');
  const [existingStopName, setExistingStopName] = useState('');
  const business = ruralBusinesses.find((existing) => ruralBusinessSlug(existing) === slug);

  if (business === undefined) {
    return (
      <section className="rural-business-page">
        <p className="rural-business-page__empty">No rural business found for "{slug}".</p>
      </section>
    );
  }

  const diagram = buildRuralBusinessFlowDiagram(network, solution, { kind: 'rural business', name: business.name });
  const modeled = network.nodes.some((node) => node.sources.some((source) =>
    source.contributor.kind === 'rural business' && source.contributor.name === business.name));
  const followFlow = (event: MouseEvent<HTMLElement | SVGElement>, path: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(path);
  };
  const connectedStations = trainStations.filter((station) => hostsBusiness(station.host, business.name));
  const connectedWarehouses = warehouses.filter((warehouse) => hostsBusiness(warehouse.host, business.name));
  const connectedStops = [
    ...connectedStations.map((station) => ({
      kind: 'Station',
      name: station.name,
      path: pathForStation(station),
    })),
    ...connectedWarehouses.map((warehouse) => ({
      kind: 'Warehouse',
      name: warehouse.name,
      path: pathForWarehouse(warehouse),
    })),
  ].sort((left, right) => left.name.localeCompare(right.name) || left.kind.localeCompare(right.kind));
  const trimmedStopName = newStopName.trim();
  const existingStopNames = newStopKind === 'station'
    ? trainStations.map((station) => station.name)
    : warehouses.map((warehouse) => warehouse.name);
  const availableExistingStops = existingStopKind === 'station'
    ? trainStations.filter((station) => hostWithBusiness(station.host, business.name) !== undefined)
    : warehouses.filter((warehouse) => hostWithBusiness(warehouse.host, business.name) !== undefined);
  const canCreateStop = trimmedStopName !== '' && !existingStopNames.includes(trimmedStopName);
  const canConnectExistingStop = availableExistingStops.some((stop) => stop.name === existingStopName);

  const handleStopKindChange = (kind: 'station' | 'warehouse') => {
    setNewStopKind(kind);
    setNewStopTracks(kind === 'station' ? stationTrackCounts[0] : warehouseTrackCounts[0]);
  };

  const createStop = () => {
    if (!canCreateStop) return;
    const host: StopHost = { kind: 'ruralBusinesses', ruralBusinesses: [business.name] };
    if (newStopKind === 'station') {
      addTrainStation({ name: trimmedStopName, tracks: newStopTracks as StationTrackCount, host });
    } else {
      addWarehouse({ name: trimmedStopName, tracks: newStopTracks as WarehouseTrackCount, host, goods: [] });
    }
    setNewStopName('');
  };

  const connectExistingStop = () => {
    if (!canConnectExistingStop) return;
    if (existingStopKind === 'station') {
      const station = trainStations.find((existing) => existing.name === existingStopName);
      const host = station === undefined ? undefined : hostWithBusiness(station.host, business.name);
      if (station === undefined || host === undefined) return;
      replaceTrainStations(trainStations.map((existing) =>
        existing.name === station.name ? { ...existing, host } : existing,
      ));
    } else {
      const warehouse = warehouses.find((existing) => existing.name === existingStopName);
      const host = warehouse === undefined ? undefined : hostWithBusiness(warehouse.host, business.name);
      if (warehouse === undefined || host === undefined) return;
      replaceWarehouses(warehouses.map((existing) =>
        existing.name === warehouse.name ? { ...existing, host } : existing,
      ));
    }
    setExistingStopName('');
  };

  return (
    <section className="rural-business-page">
      <h1>{business.name}</h1>
      <p className="rural-business-page__type">
        Type:{' '}
        <a
          href={pathForRuralBusinessType({ name: business.typeName })}
          onClick={(event) => {
            event.preventDefault();
            navigate(pathForRuralBusinessType({ name: business.typeName }));
          }}
        >
          {business.typeName}
        </a>
      </p>
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
      <section aria-label="Outflowing products" className="industry-flow-page__flow">
        <h2>Outflowing products</h2>
        {!solution.converged && <p role="status">The solver did not converge after {solution.iterations} iterations. Flows are estimates.</p>}
        {!modeled && <p role="status">This rural business is not in the modeled network. Check its connected stops and production figures.</p>}
        {solution.missingCoefficients.length > 0 && <p role="status">{solution.missingCoefficients.length} missing production figures; affected entities are excluded.</p>}
        {droppedLines.length > 0 && <details><summary>{droppedLines.length} excluded train lines</summary>
          <ul>{droppedLines.map((line) => <li key={line.line}>{line.line}: {line.reason}</li>)}</ul>
        </details>}
        <FlowSankey diagram={diagram} good={`${business.name}: outflowing products`} follow={followFlow} showGross={false} />
      </section>
      <section className="rural-business-page__connections">
        <h2>Stations &amp; Warehouses</h2>
        {connectedStops.length === 0 ? (
          <p className="rural-business-page__empty">No connected stations or warehouses.</p>
        ) : (
          <ul>
            {connectedStops.map((stop) => (
              <li key={`${stop.kind}-${stop.name}`}>
                <a
                  href={stop.path}
                  onClick={(event) => {
                    event.preventDefault();
                    navigate(stop.path);
                  }}
                >
                  {stop.name} ({stop.kind})
                </a>
              </li>
            ))}
          </ul>
        )}
        <h3>Create new</h3>
        <form
          className="rural-business-page__add"
          onSubmit={(event) => {
            event.preventDefault();
            createStop();
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
            aria-label="New stop type"
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
          <button type="submit" disabled={!canCreateStop}>
            Add
          </button>
        </form>
        <h3>Connect existing</h3>
        <form
          className="rural-business-page__add"
          onSubmit={(event) => {
            event.preventDefault();
            connectExistingStop();
          }}
        >
          <select
            value={existingStopKind}
            onChange={(event) => {
              setExistingStopKind(event.target.value as 'station' | 'warehouse');
              setExistingStopName('');
            }}
            aria-label="Existing stop type"
          >
            <option value="station">Station</option>
            <option value="warehouse">Warehouse</option>
          </select>
          <select
            value={existingStopName}
            onChange={(event) => setExistingStopName(event.target.value)}
            aria-label="Existing stop"
          >
            <option value="">Select existing stop…</option>
            {availableExistingStops.map((stop) => (
              <option key={stop.name} value={stop.name}>
                {stop.name}
              </option>
            ))}
          </select>
          <button type="submit" disabled={!canConnectExistingStop}>
            Connect
          </button>
        </form>
      </section>
    </section>
  );
}
