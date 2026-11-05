import { useEffect, type MouseEvent } from 'react';
import { useTrainStations } from '../game-state/train-stations-state';
import { useWarehouses } from '../game-state/warehouses-state';
import { stationTrackCounts, type StationTrackCount } from '../game-state/types';
import { useCities } from '../game-state/city-state';
import { useRuralBusinesses } from '../game-state/rural-businesses-state';
import { useTrainLines } from '../game-state/train-lines-state';
import { useNavigation } from '../navigation';
import { pathForStation, stationSlug } from './station-routes';
import { NavigatableHeading } from '../navigatable-heading';
import { pathForCity } from './city-routes';
import { pathForRuralBusiness } from './rural-business-routes';
import { pathForTrainLine } from './train-line-routes';
import { useGoodsFlow, stopNodeId } from '../solver';
import type { LegFlow } from '../solver';
import { buildWarehouseFlowDiagram } from '../pages/goods-flow';
import { FlowSankey } from '../pages/flow-sankey';
import { TrainLineConnectionForm } from '../pages/train-line-connection-form';
import { OnDemandDispatchTable } from '../pages/on-demand-dispatch-table';

const perWeek = (units: number) => units.toLocaleString(undefined, { maximumFractionDigits: 2 });

function amountsByGood(flows: LegFlow[]): Map<string, number> {
  const amounts = new Map<string, number>();
  for (const flow of flows) {
    amounts.set(flow.good, (amounts.get(flow.good) ?? 0) + flow.units);
  }
  return amounts;
}

function BalanceCell({ in: inAmount, out: outAmount }: { in?: number; out?: number }) {
  if (inAmount === undefined && outAmount === undefined) {
    return <td className="warehouse-page__cell--empty">–</td>;
  }
  return (
    <td>
      {inAmount !== undefined && <span className="warehouse-page__cell-in">+{perWeek(inAmount)}</span>}
      {inAmount !== undefined && outAmount !== undefined && ' / '}
      {outAmount !== undefined && <span className="warehouse-page__cell-out">-{perWeek(outAmount)}</span>}
    </td>
  );
}

export function StationPage({ slug }: { slug: string }) {
  const { trainStations, replaceTrainStations } = useTrainStations();
  const { warehouses } = useWarehouses();
  const { cities } = useCities();
  const { ruralBusinesses } = useRuralBusinesses();
  const { trainLines, addTrainLine, removeTrainLine, replaceTrainLines } = useTrainLines();
  const { navigate } = useNavigation();
  const { network, solution, droppedLines } = useGoodsFlow();
  const station = trainStations.find((existing) => stationSlug(existing) === slug);

  useEffect(() => {
    if (station === undefined) {
      return;
    }
    const previousTitle = document.title;
    document.title = `Stn: ${station.name}`;
    return () => {
      document.title = previousTitle;
    };
  }, [station]);

  if (station === undefined) {
    return (
      <section className="station-page">
        <p className="station-page__empty">No station found for "{slug}".</p>
      </section>
    );
  }

  const headings = [...trainStations]
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((entry) => ({ title: entry.name, path: pathForStation(entry) }));
  const host = station.host;
  const hostCity = host.kind === 'city' ? cities.find((city) => city.name === host.city) : undefined;
  const hostBusinesses =
    host.kind === 'ruralBusinesses'
      ? host.ruralBusinesses
          .map((name) => ruralBusinesses.find((business) => business.name === name))
          .filter((business) => business !== undefined)
      : [];
  const connectingLines = trainLines
    .filter((line) => line.stops.some((stop) => stop.kind === 'station' && stop.name === station.name))
    .sort((left, right) => left.name.localeCompare(right.name));
  const nodeId = stopNodeId({ kind: 'station', name: station.name });
  const flowDiagram = buildWarehouseFlowDiagram(network, solution, nodeId);
  const followFlow = (event: MouseEvent<HTMLElement | SVGElement>, path: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(path);
  };
  const trainLineRows = connectingLines.map((line) => {
    const dropped = droppedLines.find((entry) => entry.line === line.name);
    const legs = network.legs.filter((leg) => leg.line === line.name);
    const arriving = legs.find((leg) => leg.to === nodeId);
    const departing = legs.find((leg) => leg.from === nodeId);
    const broughtIn = amountsByGood(arriving ? solution.legFlows.filter((flow) => flow.leg === arriving.id) : []);
    const takenAway = amountsByGood(departing ? solution.legFlows.filter((flow) => flow.leg === departing.id) : []);
    return { line, dropped, broughtIn, takenAway };
  });
  const trainLineGoods = [...new Set(
    trainLineRows.flatMap((row) => [...row.broughtIn.keys(), ...row.takenAway.keys()]),
  )].sort((left, right) => left.localeCompare(right));
  const totalBroughtIn = new Map<string, number>();
  const totalTakenAway = new Map<string, number>();
  for (const row of trainLineRows) {
    if (row.dropped !== undefined) continue;
    for (const [good, units] of row.broughtIn) {
      totalBroughtIn.set(good, (totalBroughtIn.get(good) ?? 0) + units);
    }
    for (const [good, units] of row.takenAway) {
      totalTakenAway.set(good, (totalTakenAway.get(good) ?? 0) + units);
    }
  }

  return (
    <section className="station-page">
      <NavigatableHeading
        headings={headings}
        currentPath={pathForStation(station)}
        onNavigate={navigate}
        navigationLabel="station"
      />
      <label className="station-page__tracks">
        Tracks
        <select
          value={station.tracks}
          onChange={(event) =>
            replaceTrainStations(
              trainStations.map((existing) => existing.name === station.name
                ? { ...existing, tracks: Number(event.target.value) as StationTrackCount }
                : existing),
            )
          }
        >
          {stationTrackCounts.map((tracks) => <option key={tracks} value={tracks}>{tracks}</option>)}
        </select>
      </label>
      <section className="station-page__flow">
        <h2>Net goods flow</h2>
        {!solution.converged && <p role="status">The solver did not converge after {solution.iterations} iterations. Flows are estimates.</p>}
        <FlowSankey diagram={flowDiagram} good={station.name} follow={followFlow} showGross={false} />
      </section>
      <section className="station-page__connections">
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
      <section className="station-page__dispatch">
        <h2>On-demand dispatch</h2>
        <OnDemandDispatchTable stop={{ kind: 'station', name: station.name }} />
      </section>
      <section className="station-page__train-lines">
        <h2>Train lines</h2>
        {connectingLines.length === 0 ? (
          <p className="station-page__train-lines-empty">No train lines connect here.</p>
        ) : (
          <table className="warehouse-page__table station-page__table">
            <thead>
              <tr>
                <th>Train line</th>
                <th>Trains / service</th>
                <th>Tour / travel days</th>
                <th scope="col" aria-label="Actions" />
                {trainLineGoods.map((good) => <th key={good}>{good}</th>)}
              </tr>
            </thead>
            <tbody>
              {trainLineRows.map(({ line, dropped, broughtIn, takenAway }) => (
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
                    {line.type === 'ContinuousTrainLine' ? (
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={line.trains}
                      onChange={(event) =>
                        replaceTrainLines(
                          trainLines.map((existing) =>
                            existing.name === line.name && existing.type === 'ContinuousTrainLine'
                              ? { ...existing, trains: Number(event.target.value) }
                              : existing,
                          ),
                        )
                      }
                      aria-label={`${line.name} number of trains`}
                    />
                    ) : 'On demand'}
                  </td>
                  <td>
                    {line.type === 'ContinuousTrainLine' ? (
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={line.tourDays ?? ''}
                      onChange={(event) => {
                        const value = event.target.value;
                        replaceTrainLines(
                          trainLines.map((existing) =>
                            existing.name === line.name && existing.type === 'ContinuousTrainLine'
                              ? { ...existing, tourDays: value === '' ? undefined : Number(value) }
                              : existing,
                          ),
                        );
                      }}
                      aria-label={`${line.name} tour days`}
                    />
                    ) : line.travelDays ?? '—'}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => removeTrainLine(line.name)}
                      aria-label={`Remove ${line.name}`}
                      title={`Remove ${line.name}`}
                    >
                      ✕
                    </button>
                  </td>
                  {dropped !== undefined ? (
                    <td colSpan={Math.max(trainLineGoods.length, 1)} className="warehouse-page__cell--dropped">
                      Not modelled: {dropped.reason}.
                    </td>
                  ) : (
                    trainLineGoods.map((good) => (
                      <BalanceCell key={good} in={broughtIn.get(good)} out={takenAway.get(good)} />
                    ))
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan={4}>Total balance</th>
                {trainLineGoods.map((good) => (
                  <BalanceCell key={good} in={totalBroughtIn.get(good)} out={totalTakenAway.get(good)} />
                ))}
              </tr>
            </tfoot>
          </table>
        )}
        {connectingLines.some((line) => droppedLines.find((entry) => entry.line === line.name) === undefined) &&
          !solution.converged && (
            <p className="station-page__hint">The flow solver did not converge; these figures are its last estimate.</p>
          )}
        <TrainLineConnectionForm
          trainStations={trainStations}
          warehouses={warehouses}
          existingLineNames={trainLines.map((line) => line.name)}
          fixedStop={{ kind: 'station', name: station.name }}
          onAdd={addTrainLine}
        />
      </section>
    </section>
  );
}
