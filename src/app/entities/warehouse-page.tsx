import { useEffect, useState, type MouseEvent } from 'react';
import { useWarehouses } from '../game-state/warehouses-state';
import { useCities } from '../game-state/city-state';
import { useGoods } from '../game-state/goods-state';
import { useRuralBusinesses } from '../game-state/rural-businesses-state';
import { useTrainLines } from '../game-state/train-lines-state';
import { useTrainStations } from '../game-state/train-stations-state';
import { trainCargoTypes, type StopRef, type TrainCargo } from '../game-state/types';
import { useNavigation } from '../navigation';
import { warehouseSlug } from './warehouse-routes';
import { pathForCity } from './city-routes';
import { pathForRuralBusiness } from './rural-business-routes';
import { pathForTrainLine } from './train-line-routes';
import { useGoodsFlow, stopNodeId } from '../solver';
import type { LegFlow } from '../solver';
import { warehouseGoodSlotsByTracks, warehouseTrackCounts, type WarehouseTrackCount } from '../game-state/types';
import { buildWarehouseFlowDiagram } from '../pages/goods-flow';
import { FlowSankey } from '../pages/goods-flow-page';

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

export function WarehousePage({ slug }: { slug: string }) {
  const { warehouses, setWarehouseTracks, setWarehouseGoods } = useWarehouses();
  const { cities } = useCities();
  const { goods } = useGoods();
  const { ruralBusinesses } = useRuralBusinesses();
  const { trainStations } = useTrainStations();
  const { trainLines, addTrainLine, replaceTrainLines } = useTrainLines();
  const { navigate } = useNavigation();
  const { network, solution, droppedLines } = useGoodsFlow();
  const [newLineName, setNewLineName] = useState('');
  const [otherKind, setOtherKind] = useState<StopRef['kind']>('station');
  const [otherName, setOtherName] = useState('');
  const [newLineTrains, setNewLineTrains] = useState(1);
  const [newLineTourDays, setNewLineTourDays] = useState('');
  const [newLineCargo, setNewLineCargo] = useState<TrainCargo>('anything');
  const warehouse = warehouses.find((existing) => warehouseSlug(existing) === slug);

  useEffect(() => {
    if (warehouse === undefined) {
      return;
    }
    const previousTitle = document.title;
    document.title = `WH: ${warehouse.name}`;
    return () => {
      document.title = previousTitle;
    };
  }, [warehouse]);

  if (warehouse === undefined) {
    return (
      <section className="warehouse-page">
        <p className="warehouse-page__empty">No warehouse found for "{slug}".</p>
      </section>
    );
  }

  const host = warehouse.host;
  const hostCity = host.kind === 'city' ? cities.find((city) => city.name === host.city) : undefined;
  const hostBusinesses =
    host.kind === 'ruralBusinesses'
      ? host.ruralBusinesses
          .map((name) => ruralBusinesses.find((business) => business.name === name))
          .filter((business) => business !== undefined)
      : [];
  const otherStops = otherKind === 'station' ? trainStations : warehouses.filter((other) => other.name !== warehouse.name);
  const connectingLines = trainLines.filter((line) =>
    line.stops.some((stop) => stop.kind === 'warehouse' && stop.name === warehouse.name),
  ).sort((left, right) => left.name.localeCompare(right.name));
  const nodeId = stopNodeId({ kind: 'warehouse', name: warehouse.name });
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
  const trainLineGoodsSet = new Set(trainLineRows.flatMap((row) => [...row.broughtIn.keys(), ...row.takenAway.keys()]));
  const trainLineGoods = goods.filter((good) => trainLineGoodsSet.has(good));
  const totalBroughtIn = new Map<string, number>();
  const totalTakenAway = new Map<string, number>();
  for (const row of trainLineRows) {
    if (row.dropped !== undefined) continue;
    for (const [good, units] of row.broughtIn) totalBroughtIn.set(good, (totalBroughtIn.get(good) ?? 0) + units);
    for (const [good, units] of row.takenAway) totalTakenAway.set(good, (totalTakenAway.get(good) ?? 0) + units);
  }
  const totalUnloaded = [...totalBroughtIn.values()].reduce((sum, units) => sum + units, 0);
  const totalLoaded = [...totalTakenAway.values()].reduce((sum, units) => sum + units, 0);
  const goodSlots = Array.from({ length: warehouseGoodSlotsByTracks[warehouse.tracks] }, (_, index) => index);
  const canAddTrainLine =
    newLineName.trim() !== '' && otherName !== '' && newLineTrains > 0 &&
    !trainLines.some((line) => line.name === newLineName.trim());

  const addConnectedTrainLine = () => {
    if (!canAddTrainLine) return;
    const parsedTourDays = newLineTourDays.trim() === '' ? undefined : Number(newLineTourDays);
    addTrainLine({
      name: newLineName.trim(),
      stops: [
        { kind: 'warehouse', name: warehouse.name },
        { kind: otherKind, name: otherName },
      ],
      trains: newLineTrains,
      tourDays: parsedTourDays,
      cargo: newLineCargo,
    });
    setNewLineName('');
    setOtherName('');
    setNewLineTrains(1);
    setNewLineTourDays('');
    setNewLineCargo('anything');
  };

  const updateGoodSlot = (slotIndex: number, good: string) => {
    const nextGoods = warehouse.goods.slice();
    if (good === '') {
      nextGoods.splice(slotIndex, 1);
    } else if (slotIndex < nextGoods.length) {
      nextGoods[slotIndex] = good;
    } else {
      nextGoods.push(good);
    }
    setWarehouseGoods(warehouse.name, nextGoods);
  };

  return (
    <section className="warehouse-page">
      <h1>{warehouse.name}</h1>
      <label className="warehouse-page__tracks">
        Tracks
        <select
          value={warehouse.tracks}
          onChange={(event) =>
            setWarehouseTracks(warehouse.name, Number(event.target.value) as WarehouseTrackCount)
          }
        >
          {warehouseTrackCounts.map((tracks) => (
            <option key={tracks} value={tracks}>
              {tracks}
            </option>
          ))}
        </select>
      </label>
      <section className="warehouse-page__goods">
        <h2>Goods handled</h2>
        <table className="warehouse-page__table warehouse-page__goods-table">
          <thead>
            <tr>
              <th>Good</th>
              <th>Goods in (units/week)</th>
              <th>Goods out (units/week)</th>
            </tr>
          </thead>
          <tbody>
            {goodSlots.map((slotIndex) => {
              const good = warehouse.goods[slotIndex];
              const flow = good === undefined
                ? undefined
                : solution.nodeFlows.find((entry) => entry.node === nodeId && entry.good === good);

              return (
                <tr key={slotIndex}>
                  <td>
                    <select
                      aria-label={`Good ${slotIndex + 1}`}
                      value={good ?? ''}
                      disabled={slotIndex > warehouse.goods.length}
                      onChange={(event) => updateGoodSlot(slotIndex, event.target.value)}
                    >
                      <option value="">Select good…</option>
                      {goods
                        .filter((option) => !warehouse.goods.includes(option) || good === option)
                        .map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                    </select>
                  </td>
                  <td>{good === undefined ? '—' : perWeek(flow?.unloaded ?? 0)}</td>
                  <td>{good === undefined ? '—' : perWeek(flow?.loaded ?? 0)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
      <section className="warehouse-page__flow">
        <h2>Net goods flow</h2>
        {!solution.converged && <p role="status">The solver did not converge after {solution.iterations} iterations. Flows are estimates.</p>}
        <FlowSankey diagram={flowDiagram} good={warehouse.name} follow={followFlow} showGross={false} />
      </section>
      <section className="warehouse-page__connections">
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
      <section className="warehouse-page__train-lines">
        <h2>Train lines</h2>
        {connectingLines.length === 0 ? (
          <p className="warehouse-page__train-lines-empty">No train lines connect here.</p>
        ) : (
          <table className="warehouse-page__table warehouse-page__train-lines-table">
            <thead>
              <tr>
                <th>Train line</th>
                <th>Number of trains</th>
                <th>Tour days</th>
                {trainLineGoods.map((good) => (
                  <th key={good}>{good}</th>
                ))}
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
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={line.trains}
                      onChange={(event) =>
                        replaceTrainLines(
                          trainLines.map((existing) =>
                            existing.name === line.name
                              ? { ...existing, trains: Number(event.target.value) }
                              : existing,
                          ),
                        )
                      }
                      aria-label={`${line.name} number of trains`}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={line.tourDays ?? ''}
                      onChange={(event) => {
                        const value = event.target.value;
                        replaceTrainLines(
                          trainLines.map((existing) =>
                            existing.name === line.name
                              ? { ...existing, tourDays: value === '' ? undefined : Number(value) }
                              : existing,
                          ),
                        );
                      }}
                      aria-label={`${line.name} tour days`}
                    />
                  </td>
                  {dropped !== undefined ? (
                    <td colSpan={trainLineGoods.length} className="warehouse-page__cell--dropped">
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
                <th colSpan={3}>Total balance</th>
                {trainLineGoods.map((good) => (
                  <BalanceCell key={good} in={totalBroughtIn.get(good)} out={totalTakenAway.get(good)} />
                ))}
              </tr>
            </tfoot>
          </table>
        )}
        {connectingLines.length > 0 && (
          <p className="warehouse-page__totals">
            Total weekly units unloaded: {perWeek(totalUnloaded)} · loaded: {perWeek(totalLoaded)}
          </p>
        )}
        {connectingLines.some((line) => droppedLines.find((entry) => entry.line === line.name) === undefined) &&
          !solution.converged && (
            <p className="warehouse-page__hint">The flow solver did not converge; these figures are its last estimate.</p>
          )}
        <form
          className="train-lines-page__add"
          onSubmit={(event) => {
            event.preventDefault();
            addConnectedTrainLine();
          }}
        >
          <input
            type="text"
            value={newLineName}
            onChange={(event) => setNewLineName(event.target.value)}
            placeholder="Name"
            aria-label="Train line name"
          />
          <span>{warehouse.name} (Warehouse)</span>
          <select
            value={otherKind}
            onChange={(event) => {
              setOtherKind(event.target.value as StopRef['kind']);
              setOtherName('');
            }}
            aria-label="Other stop type"
          >
            <option value="station">Station</option>
            <option value="warehouse">Warehouse</option>
          </select>
          <select value={otherName} onChange={(event) => setOtherName(event.target.value)} aria-label="Other stop">
            <option value="">Select stop…</option>
            {otherStops.map((stop) => (
              <option key={stop.name} value={stop.name}>
                {stop.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            value={newLineTrains}
            onChange={(event) => setNewLineTrains(Number(event.target.value))}
            aria-label="Trains"
          />
          <input
            type="number"
            min={0}
            value={newLineTourDays}
            onChange={(event) => setNewLineTourDays(event.target.value)}
            placeholder="Tour days"
            aria-label="Tour days"
          />
          <select
            value={newLineCargo}
            onChange={(event) => setNewLineCargo(event.target.value as TrainCargo)}
            aria-label="Cargo"
          >
            {trainCargoTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <button type="submit" disabled={!canAddTrainLine}>
            Add
          </button>
        </form>
      </section>
    </section>
  );
}
