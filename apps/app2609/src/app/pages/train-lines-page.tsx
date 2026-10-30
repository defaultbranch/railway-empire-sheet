import { useState } from 'react';
import type { StopRef, TrainCargo } from '../game-state/types';
import { trainCargoTypes } from '../game-state/types';
import { useTrainStations } from '../game-state/train-stations-state';
import { useWarehouses } from '../game-state/warehouses-state';
import { useTrainLines } from '../game-state/train-lines-state';
import { useNavigation } from '../navigation';
import { pathForStation } from '../entities/station-routes';
import { pathForWarehouse } from '../entities/warehouse-routes';
import { pathForTrainLine } from '../entities/train-line-routes';
import { useGoodsFlow } from '../solver';

type StopKind = StopRef['kind'];
type SortKey = 'name' | 'tourDays' | 'yield' | 'utilization';

export function TrainLinesPage() {
  const { navigate } = useNavigation();
  const { trainStations } = useTrainStations();
  const { warehouses } = useWarehouses();
  const { trainLines, addTrainLine, removeTrainLine } = useTrainLines();
  const { network, revenue, droppedLines, solution } = useGoodsFlow();
  const revenueByLine = new Map(revenue.lines.map((entry) => [entry.line, entry]));
  const droppedByLine = new Map(droppedLines.map((entry) => [entry.line, entry.reason]));
  const unitsByLeg = new Map<string, number>();
  for (const flow of solution.legFlows) {
    unitsByLeg.set(flow.leg, (unitsByLeg.get(flow.leg) ?? 0) + flow.units);
  }
  const utilizationByLine = new Map(trainLines.map((line) => {
    const legs = network.legs.filter((leg) => leg.line === line.name);
    if (droppedByLine.has(line.name) || legs.length !== 2) return [line.name, undefined] as const;
    const utilization = legs.reduce((sum, leg) => {
      return sum + (leg.capacity > 0 ? (unitsByLeg.get(leg.id) ?? 0) / leg.capacity : 0);
    }, 0) / legs.length;
    return [line.name, utilization] as const;
  }));
  const currency = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const percentage = new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 1 });
  const [sort, setSort] = useState<{ key: SortKey; descending: boolean }>({ key: 'name', descending: false });

  const [newName, setNewName] = useState('');
  const [fromKind, setFromKind] = useState<StopKind>('station');
  const [fromName, setFromName] = useState('');
  const [toKind, setToKind] = useState<StopKind>('station');
  const [toName, setToName] = useState('');
  const [trains, setTrains] = useState(1);
  const [tourDays, setTourDays] = useState('');
  const [cargo, setCargo] = useState<TrainCargo>('anything');

  const sortedLines = [...trainLines].sort((left, right) => {
    const direction = sort.descending ? -1 : 1;
    if (sort.key === 'name') return direction * left.name.localeCompare(right.name);
    const leftValue = sort.key === 'tourDays' ? left.tourDays
      : sort.key === 'yield'
        ? droppedByLine.has(left.name) ? undefined : revenueByLine.get(left.name)?.weeklyYieldPerTrain ?? 0
        : utilizationByLine.get(left.name);
    const rightValue = sort.key === 'tourDays' ? right.tourDays
      : sort.key === 'yield'
        ? droppedByLine.has(right.name) ? undefined : revenueByLine.get(right.name)?.weeklyYieldPerTrain ?? 0
        : utilizationByLine.get(right.name);
    if (leftValue === undefined && rightValue !== undefined) return 1;
    if (rightValue === undefined && leftValue !== undefined) return -1;
    return direction * ((leftValue ?? 0) - (rightValue ?? 0)) || left.name.localeCompare(right.name);
  });

  const sortHeader = (key: SortKey, label: string) => (
    <th aria-sort={sort.key === key ? sort.descending ? 'descending' : 'ascending' : 'none'}>
      <button
        type="button"
        onClick={() => setSort({ key, descending: sort.key === key ? !sort.descending : false })}
      >
        {label} <span aria-hidden="true">{sort.key === key ? sort.descending ? '↓' : '↑' : '↕'}</span>
      </button>
    </th>
  );

  const optionsFor = (kind: StopKind) => [...(kind === 'station' ? trainStations : warehouses)]
    .sort((left, right) => left.name.localeCompare(right.name));

  const stopLabel = (stop: StopRef) => `${stop.name} (${stop.kind === 'station' ? 'Station' : 'Warehouse'})`;

  const stopPath = (stop: StopRef) => (stop.kind === 'station' ? pathForStation(stop) : pathForWarehouse(stop));

  const canAdd = newName.trim() !== '' && fromName !== '' && toName !== '' && trains > 0;

  const handleAdd = () => {
    if (!canAdd) return;
    const parsedTourDays = tourDays.trim() === '' ? undefined : Number(tourDays);
    addTrainLine({
      name: newName.trim(),
      stops: [
        { kind: fromKind, name: fromName },
        { kind: toKind, name: toName },
      ],
      trains,
      tourDays: parsedTourDays,
      cargo,
    });
    setNewName('');
    setFromName('');
    setToName('');
    setTrains(1);
    setTourDays('');
    setCargo('anything');
  };

  return (
    <div className="train-lines-page">
      <table className="train-lines-page__table">
        <thead>
          <tr>
            {sortHeader('name', 'Name')}
            <th>Stops</th>
            <th>Trains</th>
            {sortHeader('tourDays', 'Tour days')}
            <th>Cargo</th>
            {sortHeader('yield', 'Yield / train / week')}
            {sortHeader('utilization', 'Utilization')}
            <th />
          </tr>
        </thead>
        <tbody>
          {trainLines.length === 0 && (
            <tr>
              <td colSpan={8} className="train-lines-page__empty">
                No train lines yet.
              </td>
            </tr>
          )}
          {sortedLines.map((line) => (
            <tr key={line.name}>
              <td>
                <a
                  href={pathForTrainLine(line)}
                  onClick={(event) => {
                    event.preventDefault();
                    navigate(pathForTrainLine(line));
                  }}
                >
                  {line.name}
                </a>
              </td>
              <td>
                {line.stops.map((stop, index) => (
                  <div key={`${stop.kind}-${stop.name}-${index}`}>
                    <a
                      href={stopPath(stop)}
                      onClick={(event) => {
                        event.preventDefault();
                        navigate(stopPath(stop));
                      }}
                    >
                      {stopLabel(stop)}
                    </a>
                  </div>
                ))}
              </td>
              <td>{line.trains}</td>
              <td>{line.tourDays ?? '—'}</td>
              <td>{line.cargo}</td>
              <td title={droppedByLine.get(line.name)}>
                {droppedByLine.has(line.name) ? 'Not modelled' : currency.format(revenueByLine.get(line.name)?.weeklyYieldPerTrain ?? 0)}
              </td>
              <td title={droppedByLine.get(line.name)}>
                {utilizationByLine.get(line.name) === undefined ? 'Not modelled' : percentage.format(utilizationByLine.get(line.name) ?? 0)}
              </td>
              <td>
                <button type="button" onClick={() => removeTrainLine(line.name)} aria-label={`Remove ${line.name}`}>
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!solution.converged && (
        <p className="train-lines-page__hint">The flow solver did not converge; yield rates are estimates.</p>
      )}
      <form
        className="train-lines-page__add"
        onSubmit={(event) => {
          event.preventDefault();
          handleAdd();
        }}
      >
        <input type="text" value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Name" />
        <select
          value={fromKind}
          onChange={(event) => {
            setFromKind(event.target.value as StopKind);
            setFromName('');
          }}
        >
          <option value="station">Station</option>
          <option value="warehouse">Warehouse</option>
        </select>
        <select value={fromName} onChange={(event) => setFromName(event.target.value)}>
          <option value="">Select stop…</option>
          {optionsFor(fromKind).map((stop) => (
            <option key={stop.name} value={stop.name}>
              {stop.name}
            </option>
          ))}
        </select>
        <select
          value={toKind}
          onChange={(event) => {
            setToKind(event.target.value as StopKind);
            setToName('');
          }}
        >
          <option value="station">Station</option>
          <option value="warehouse">Warehouse</option>
        </select>
        <select value={toName} onChange={(event) => setToName(event.target.value)}>
          <option value="">Select stop…</option>
          {optionsFor(toKind).map((stop) => (
            <option key={stop.name} value={stop.name}>
              {stop.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          value={trains}
          onChange={(event) => setTrains(Number(event.target.value))}
          aria-label="Trains"
        />
        <input
          type="number"
          min={0}
          value={tourDays}
          onChange={(event) => setTourDays(event.target.value)}
          placeholder="Tour days"
          aria-label="Tour days"
        />
        <select value={cargo} onChange={(event) => setCargo(event.target.value as TrainCargo)} aria-label="Cargo">
          {trainCargoTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <button type="submit" disabled={!canAdd}>
          Add
        </button>
      </form>
      {trainStations.length === 0 && warehouses.length === 0 && (
        <p className="train-lines-page__hint">Add a station or warehouse on the previous page first.</p>
      )}
    </div>
  );
}
