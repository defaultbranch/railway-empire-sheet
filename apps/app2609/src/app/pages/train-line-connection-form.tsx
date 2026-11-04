import { useState } from 'react';
import { trainCargoTypes, type StopRef, type TrainCargo, type TrainStation, type Warehouse } from '../game-state/types';
import type { ContinuousTrainLine } from '../game-state/types';

type Props = {
  trainStations: Pick<TrainStation, 'name'>[];
  warehouses: Pick<Warehouse, 'name'>[];
  existingLineNames: readonly string[];
  fixedStop?: StopRef;
  onAdd: (line: ContinuousTrainLine) => void;
};

type StopKind = StopRef['kind'];

const stopLabel = (stop: StopRef) => `${stop.name} (${stop.kind === 'station' ? 'Station' : 'Warehouse'})`;

export function TrainLineConnectionForm({ trainStations, warehouses, existingLineNames, fixedStop, onAdd }: Props) {
  const [name, setName] = useState('');
  const [fromKind, setFromKind] = useState<StopKind>('station');
  const [fromName, setFromName] = useState('');
  const [toKind, setToKind] = useState<StopKind>('station');
  const [toName, setToName] = useState('');
  const [trains, setTrains] = useState(1);
  const [tourDays, setTourDays] = useState('');
  const [cargo, setCargo] = useState<TrainCargo>('anything');

  const optionsFor = (kind: StopKind, excludeFixedStop = false) => {
    const options = kind === 'station' ? trainStations : warehouses;
    return [...options]
      .filter((stop) => !excludeFixedStop || fixedStop?.kind !== kind || fixedStop.name !== stop.name)
      .sort((left, right) => left.name.localeCompare(right.name));
  };
  const originKind = fixedStop?.kind ?? fromKind;
  const originName = fixedStop?.name ?? fromName;
  const validOrigin = fixedStop !== undefined || optionsFor(fromKind).some((stop) => stop.name === fromName);
  const validDestination = optionsFor(toKind, fixedStop !== undefined).some((stop) => stop.name === toName);
  const canAdd = name.trim() !== '' && validOrigin && validDestination && trains > 0 &&
    !existingLineNames.includes(name.trim());

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canAdd) return;
    onAdd({
      type: 'ContinuousTrainLine',
      name: name.trim(),
      stops: [
        { kind: originKind, name: originName },
        { kind: toKind, name: toName },
      ],
      trains,
      tourDays: tourDays.trim() === '' ? undefined : Number(tourDays),
      cargo,
    });
    setName('');
    setFromName('');
    setToName('');
    setTrains(1);
    setTourDays('');
    setCargo('anything');
  };

  return (
    <form className="train-lines-page__add" onSubmit={handleSubmit}>
      <input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" aria-label="Train line name" />
      {fixedStop === undefined ? (
        <>
          <select
            value={fromKind}
            onChange={(event) => {
              setFromKind(event.target.value as StopKind);
              setFromName('');
            }}
            aria-label="Origin stop type"
          >
            <option value="station">Station</option>
            <option value="warehouse">Warehouse</option>
          </select>
          <select value={fromName} onChange={(event) => setFromName(event.target.value)} aria-label="Origin stop">
            <option value="">Select stop…</option>
            {optionsFor(fromKind).map((stop) => (
              <option key={stop.name} value={stop.name}>{stop.name}</option>
            ))}
          </select>
        </>
      ) : <span>{stopLabel(fixedStop)}</span>}
      <select
        value={toKind}
        onChange={(event) => {
          setToKind(event.target.value as StopKind);
          setToName('');
        }}
        aria-label={fixedStop === undefined ? 'Destination stop type' : 'Other stop type'}
      >
        <option value="station">Station</option>
        <option value="warehouse">Warehouse</option>
      </select>
      <select
        value={toName}
        onChange={(event) => setToName(event.target.value)}
        aria-label={fixedStop === undefined ? 'Destination stop' : 'Other stop'}
      >
        <option value="">Select stop…</option>
        {optionsFor(toKind, fixedStop !== undefined).map((stop) => (
          <option key={stop.name} value={stop.name}>{stop.name}</option>
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
        {trainCargoTypes.map((type) => <option key={type} value={type}>{type}</option>)}
      </select>
      <button type="submit" disabled={!canAdd}>Add</button>
    </form>
  );
}
