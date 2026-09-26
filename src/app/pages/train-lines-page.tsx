import { useState } from 'react';
import type { StopRef, TrainCargo } from '../game-state/types';
import { trainCargoTypes } from '../game-state/types';
import { useTrainStations } from '../game-state/train-stations-state';
import { useWarehouses } from '../game-state/warehouses-state';
import { useTrainLines } from '../game-state/train-lines-state';

type StopKind = StopRef['kind'];

export function TrainLinesPage() {
  const { trainStations } = useTrainStations();
  const { warehouses } = useWarehouses();
  const { trainLines, addTrainLine, removeTrainLine } = useTrainLines();

  const [newName, setNewName] = useState('');
  const [fromKind, setFromKind] = useState<StopKind>('station');
  const [fromName, setFromName] = useState('');
  const [toKind, setToKind] = useState<StopKind>('station');
  const [toName, setToName] = useState('');
  const [trains, setTrains] = useState(1);
  const [tourDays, setTourDays] = useState('');
  const [cargo, setCargo] = useState<TrainCargo>('anything');

  const optionsFor = (kind: StopKind) => (kind === 'station' ? trainStations : warehouses);

  const stopLabel = (stop: StopRef) => `${stop.name} (${stop.kind === 'station' ? 'Station' : 'Warehouse'})`;

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
            <th>Name</th>
            <th>Stops</th>
            <th>Trains</th>
            <th>Tour days</th>
            <th>Cargo</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {trainLines.length === 0 && (
            <tr>
              <td colSpan={6} className="train-lines-page__empty">
                No train lines yet.
              </td>
            </tr>
          )}
          {trainLines.map((line) => (
            <tr key={line.name}>
              <td>{line.name}</td>
              <td>
                {line.stops.map((stop, index) => (
                  <div key={`${stop.kind}-${stop.name}-${index}`}>{stopLabel(stop)}</div>
                ))}
              </td>
              <td>{line.trains}</td>
              <td>{line.tourDays ?? '—'}</td>
              <td>{line.cargo}</td>
              <td>
                <button type="button" onClick={() => removeTrainLine(line.name)} aria-label={`Remove ${line.name}`}>
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
