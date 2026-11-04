import { useState } from 'react';
import {
  GameDate,
  trainCargoTypes,
  type StopRef,
  type TrainCargo,
  type TrainLine,
  type TrainStation,
  type Warehouse,
} from '../game-state/types';

type Props = {
  trainStations: Pick<TrainStation, 'name'>[];
  warehouses: Pick<Warehouse, 'name'>[];
  existingLineNames: readonly string[];
  fixedStop?: StopRef;
  onAdd: (line: TrainLine) => void;
};

type StopKind = StopRef['kind'];
type TrainLineFormValues = {
  lineType: TrainLine['type'];
  name: string;
  stops: [StopRef, StopRef];
  trains: number;
  tourDays: string;
  travelDays: string;
  lastDispatchDate: string;
  cargo: TrainCargo;
  existingLineNames: readonly string[];
};

const stopLabel = (stop: StopRef) => `${stop.name} (${stop.kind === 'station' ? 'Station' : 'Warehouse'})`;

export function createTrainLineFromForm(values: TrainLineFormValues): TrainLine | undefined {
  const name = values.name.trim();
  if (name === '' || values.existingLineNames.includes(name) || values.stops.some((stop) => stop.name.trim() === '')) {
    return undefined;
  }

  if (values.lineType === 'ContinuousTrainLine') {
    const tourDays = values.tourDays.trim() === '' ? undefined : Number(values.tourDays);
    if (!Number.isFinite(values.trains) || values.trains <= 0 ||
      (tourDays !== undefined && (!Number.isFinite(tourDays) || tourDays < 0))) return undefined;
    return {
      type: 'ContinuousTrainLine',
      name,
      stops: values.stops,
      trains: values.trains,
      tourDays,
      cargo: values.cargo,
    };
  }

  const travelDays = values.travelDays.trim() === '' ? undefined : Number(values.travelDays);
  const lastDispatchDate = values.lastDispatchDate.trim() === '' ? undefined : values.lastDispatchDate;
  const [origin, destination] = values.stops;
  if ((origin.kind === destination.kind && origin.name === destination.name) ||
    (travelDays !== undefined && (!Number.isFinite(travelDays) || travelDays <= 0)) ||
    (lastDispatchDate !== undefined && !GameDate.isInstance(lastDispatchDate))) return undefined;

  return {
    type: 'OnDemandTrainLine',
    name,
    stops: values.stops,
    travelDays,
    lastDispatchDate,
    cargo: values.cargo,
  };
}

export function TrainLineConnectionForm({ trainStations, warehouses, existingLineNames, fixedStop, onAdd }: Props) {
  const [name, setName] = useState('');
  const [lineType, setLineType] = useState<TrainLine['type']>('ContinuousTrainLine');
  const [fromKind, setFromKind] = useState<StopKind>('station');
  const [fromName, setFromName] = useState('');
  const [toKind, setToKind] = useState<StopKind>('station');
  const [toName, setToName] = useState('');
  const [trains, setTrains] = useState(1);
  const [tourDays, setTourDays] = useState('');
  const [travelDays, setTravelDays] = useState('');
  const [lastDispatchDate, setLastDispatchDate] = useState('');
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
  const line = validOrigin && validDestination
    ? createTrainLineFromForm({
        lineType,
        name,
        stops: [{ kind: originKind, name: originName }, { kind: toKind, name: toName }],
        trains,
        tourDays,
        travelDays,
        lastDispatchDate,
        cargo,
        existingLineNames,
      })
    : undefined;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (line === undefined) return;
    onAdd(line);
    setName('');
    setFromName('');
    setToName('');
    setTrains(1);
    setTourDays('');
    setTravelDays('');
    setLastDispatchDate('');
    setCargo('anything');
  };

  return (
    <form className="train-lines-page__add" onSubmit={handleSubmit}>
      <input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" aria-label="Train line name" />
      <select value={lineType} onChange={(event) => setLineType(event.target.value as TrainLine['type'])} aria-label="Service type">
        <option value="ContinuousTrainLine">Continuous</option>
        <option value="OnDemandTrainLine">On demand</option>
      </select>
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
      {lineType === 'ContinuousTrainLine' ? (
        <>
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
        </>
      ) : (
        <>
          <input
            type="number"
            min={0}
            step="any"
            value={travelDays}
            onChange={(event) => setTravelDays(event.target.value)}
            placeholder="Travel days"
            aria-label="One-way travel days"
          />
          <input
            type="date"
            value={lastDispatchDate}
            onChange={(event) => setLastDispatchDate(event.target.value)}
            aria-label="Last dispatch date"
          />
        </>
      )}
      <select value={cargo} onChange={(event) => setCargo(event.target.value as TrainCargo)} aria-label="Cargo">
        {trainCargoTypes.map((type) => <option key={type} value={type}>{type}</option>)}
      </select>
      <button type="submit" disabled={line === undefined}>Add</button>
    </form>
  );
}
