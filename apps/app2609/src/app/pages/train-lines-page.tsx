import { useState } from 'react';
import type { StopRef } from '../game-state/types';
import { useTrainStations } from '../game-state/train-stations-state';
import { useWarehouses } from '../game-state/warehouses-state';
import { useTrainLines } from '../game-state/train-lines-state';
import { useNavigation } from '../navigation';
import { pathForStation } from '../entities/station-routes';
import { pathForWarehouse } from '../entities/warehouse-routes';
import { pathForTrainLine } from '../entities/train-line-routes';
import { useGoodsFlow } from '../solver';
import { TrainLineConnectionForm } from './train-line-connection-form';

type SortKey = 'name' | 'duration' | 'yield' | 'utilization';

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
    if (droppedByLine.has(line.name) || line.type === 'OnDemandTrainLine' || legs.length !== 2) {
      return [line.name, undefined] as const;
    }
    const utilization = legs.reduce((sum, leg) => {
      return sum + (leg.capacity > 0 ? (unitsByLeg.get(leg.id) ?? 0) / leg.capacity : 0);
    }, 0) / legs.length;
    return [line.name, utilization] as const;
  }));
  const currency = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const percentage = new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 1 });
  const [sort, setSort] = useState<{ key: SortKey; descending: boolean }>({ key: 'name', descending: false });

  const yieldPerTrain = (line: (typeof trainLines)[number]) =>
    droppedByLine.has(line.name) || line.type === 'OnDemandTrainLine' || !revenue.journeyTimeKnown
      ? undefined
      : revenueByLine.get(line.name)?.weeklyYieldPerTrain;

  const sortedLines = [...trainLines].sort((left, right) => {
    const direction = sort.descending ? -1 : 1;
    if (sort.key === 'name') return direction * left.name.localeCompare(right.name);
    const leftValue = sort.key === 'duration'
      ? left.type === 'ContinuousTrainLine' ? left.tourDays : left.travelDays
      : sort.key === 'yield'
        ? yieldPerTrain(left)
        : utilizationByLine.get(left.name);
    const rightValue = sort.key === 'duration'
      ? right.type === 'ContinuousTrainLine' ? right.tourDays : right.travelDays
      : sort.key === 'yield'
        ? yieldPerTrain(right)
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

  const stopLabel = (stop: StopRef) => `${stop.name} (${stop.kind === 'station' ? 'Station' : 'Warehouse'})`;

  const stopPath = (stop: StopRef) => (stop.kind === 'station' ? pathForStation(stop) : pathForWarehouse(stop));

  return (
    <div className="train-lines-page">
      <table className="train-lines-page__table">
        <thead>
          <tr>
            {sortHeader('name', 'Name')}
            <th>Stops</th>
                <th>Service</th>
                {sortHeader('duration', 'Duration (days)')}
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
              <td>{line.type === 'ContinuousTrainLine' ? `${line.trains} trains` : 'On demand'}</td>
              <td>{(line.type === 'ContinuousTrainLine' ? line.tourDays : line.travelDays) ?? '—'}</td>
              <td>{line.cargo}</td>
              <td title={droppedByLine.get(line.name)}>
                {droppedByLine.has(line.name) ? 'Not modelled' : line.type === 'OnDemandTrainLine' ? '—'
                  : !revenue.journeyTimeKnown ? 'Unknown' : currency.format(revenueByLine.get(line.name)?.weeklyYieldPerTrain ?? 0)}
              </td>
              <td title={droppedByLine.get(line.name)}>
                {droppedByLine.has(line.name) ? 'Not modelled' : line.type === 'OnDemandTrainLine' ? '—'
                  : percentage.format(utilizationByLine.get(line.name) ?? 0)}
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
      <TrainLineConnectionForm
        trainStations={trainStations}
        warehouses={warehouses}
        existingLineNames={trainLines.map((line) => line.name)}
        onAdd={addTrainLine}
      />
      {trainStations.length === 0 && warehouses.length === 0 && (
        <p className="train-lines-page__hint">Add a station or warehouse on the previous page first.</p>
      )}
    </div>
  );
}
