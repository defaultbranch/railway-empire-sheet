import { useEffect } from 'react';
import { useWarehouses } from '../game-state/warehouses-state';
import { useCities } from '../game-state/city-state';
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

function GoodsTable({ flows }: { flows: LegFlow[] }) {
  const sorted = [...flows].sort((a, b) => b.units - a.units);

  if (sorted.length === 0) {
    return <p className="warehouse-page__empty">None.</p>;
  }

  return (
    <table className="warehouse-page__table">
      <thead>
        <tr>
          <th>Good</th>
          <th>Units per week</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((flow) => (
          <tr key={flow.good}>
            <td>{flow.good}</td>
            <td>{perWeek(flow.units)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function WarehousePage({ slug }: { slug: string }) {
  const { warehouses } = useWarehouses();
  const { cities } = useCities();
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
          connectingLines.map((line) => {
            const dropped = droppedLines.find((entry) => entry.line === line.name);
            const legs = network.legs.filter((leg) => leg.line === line.name);
            const arriving = legs.find((leg) => leg.to === nodeId);
            const departing = legs.find((leg) => leg.from === nodeId);
            const broughtIn = arriving
              ? solution.legFlows.filter((flow) => flow.leg === arriving.id)
              : [];
            const takenAway = departing
              ? solution.legFlows.filter((flow) => flow.leg === departing.id)
              : [];

            return (
              <section className="warehouse-page__train-line" key={line.name}>
                <h3>
                  <a
                    href={pathForTrainLine(line)}
                    onClick={(event) => {
                      event.preventDefault();
                      navigate(pathForTrainLine(line));
                    }}
                  >
                    {line.name}
                  </a>
                </h3>
                {dropped !== undefined ? (
                  <p className="warehouse-page__empty">Not modelled: {dropped.reason}.</p>
                ) : (
                  <>
                    <div className="warehouse-page__train-line-flow">
                      <h4>Brings in</h4>
                      <GoodsTable flows={broughtIn} />
                    </div>
                    <div className="warehouse-page__train-line-flow">
                      <h4>Takes away</h4>
                      <GoodsTable flows={takenAway} />
                    </div>
                  </>
                )}
              </section>
            );
          })
        )}
        {connectingLines.some((line) => droppedLines.find((entry) => entry.line === line.name) === undefined) &&
          !solution.converged && (
            <p className="warehouse-page__hint">The flow solver did not converge; these figures are its last estimate.</p>
          )}
      </section>
    </section>
  );
}
