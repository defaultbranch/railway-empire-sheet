import { useEffect } from 'react';
import { useWarehouses } from '../game-state/warehouses-state';
import { useCities } from '../game-state/city-state';
import { useGoods } from '../game-state/goods-state';
import { useRuralBusinesses } from '../game-state/rural-businesses-state';
import { useTrainLines } from '../game-state/train-lines-state';
import { useNavigation } from '../navigation';
import { warehouseSlug } from './warehouse-routes';
import { pathForCity } from './city-routes';
import { pathForRuralBusiness } from './rural-business-routes';
import { pathForTrainLine } from './train-line-routes';
import { useGoodsFlow, stopNodeId } from '../solver';
import type { LegFlow } from '../solver';

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
  const { warehouses } = useWarehouses();
  const { cities } = useCities();
  const { goods } = useGoods();
  const { ruralBusinesses } = useRuralBusinesses();
  const { trainLines } = useTrainLines();
  const { navigate } = useNavigation();
  const { network, solution, droppedLines } = useGoodsFlow();
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
  const connectingLines = trainLines.filter((line) =>
    line.stops.some((stop) => stop.kind === 'warehouse' && stop.name === warehouse.name),
  );
  const nodeId = stopNodeId({ kind: 'warehouse', name: warehouse.name });

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

  return (
    <section className="warehouse-page">
      <h1>{warehouse.name}</h1>
      <p className="warehouse-page__tracks">Tracks: {warehouse.tracks}</p>
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
                <th>Total balance</th>
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
      </section>
    </section>
  );
}
