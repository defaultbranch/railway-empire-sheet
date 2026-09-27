import { useTrainLines } from '../game-state/train-lines-state';
import { useNavigation } from '../navigation';
import { trainLineSlug } from './train-line-routes';
import { pathForStation } from './station-routes';
import { pathForWarehouse } from './warehouse-routes';
import type { StopRef } from '../game-state/types';
import { useGoodsFlow } from '../solver';
import type { Leg, LegFlow } from '../solver';

const stopLabel = (stop: StopRef) => `${stop.name} (${stop.kind === 'station' ? 'Station' : 'Warehouse'})`;

const stopPath = (stop: StopRef) => (stop.kind === 'station' ? pathForStation(stop) : pathForWarehouse(stop));

const nodeLabel = (node: string) => node.slice(node.indexOf(':') + 1);

const perWeek = (units: number) => units.toLocaleString(undefined, { maximumFractionDigits: 2 });

function LegCargo({ leg, flows }: { leg: Leg; flows: LegFlow[] }) {
  const carried = flows.filter((flow) => flow.leg === leg.id).sort((a, b) => b.units - a.units);
  const total = carried.reduce((sum, flow) => sum + flow.units, 0);

  return (
    <section className="train-line-page__leg">
      <h3>
        {nodeLabel(leg.from)} → {nodeLabel(leg.to)}
      </h3>
      {carried.length === 0 ? (
        <p className="train-line-page__empty">Runs empty.</p>
      ) : (
        <table className="train-line-page__table">
          <thead>
            <tr>
              <th>Good</th>
              <th>Units per week</th>
            </tr>
          </thead>
          <tbody>
            {carried.map((flow) => (
              <tr key={flow.good}>
                <td>{flow.good}</td>
                <td>{perWeek(flow.units)}</td>
              </tr>
            ))}
            <tr>
              <td>Total</td>
              <td>
                {perWeek(total)} of {perWeek(leg.capacity)}
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </section>
  );
}

export function TrainLinePage({ slug }: { slug: string }) {
  const { trainLines } = useTrainLines();
  const { navigate } = useNavigation();
  const { network, solution, droppedLines } = useGoodsFlow();
  const trainLine = trainLines.find((existing) => trainLineSlug(existing) === slug);

  if (trainLine === undefined) {
    return (
      <section className="train-line-page">
        <p className="train-line-page__empty">No train line found for "{slug}".</p>
      </section>
    );
  }

  const legs = network.legs.filter((leg) => leg.line === trainLine.name);
  const dropped = droppedLines.find((entry) => entry.line === trainLine.name);

  return (
    <section className="train-line-page">
      <h1>{trainLine.name}</h1>
      <p className="train-line-page__trains">Trains: {trainLine.trains}</p>
      <p className="train-line-page__tour-days">Tour days: {trainLine.tourDays ?? '—'}</p>
      <p className="train-line-page__cargo">Cargo: {trainLine.cargo}</p>
      <section className="train-line-page__stops">
        <h2>Stops</h2>
        <ul>
          {trainLine.stops.map((stop, index) => (
            <li key={`${stop.kind}-${stop.name}-${index}`}>
              <a
                href={stopPath(stop)}
                onClick={(event) => {
                  event.preventDefault();
                  navigate(stopPath(stop));
                }}
              >
                {stopLabel(stop)}
              </a>
            </li>
          ))}
        </ul>
      </section>
      <section className="train-line-page__flow">
        <h2>Goods carried</h2>
        {dropped !== undefined ? (
          <p className="train-line-page__empty">Not modelled: {dropped.reason}.</p>
        ) : (
          legs.map((leg) => <LegCargo key={leg.id} leg={leg} flows={solution.legFlows} />)
        )}
        {dropped === undefined && !solution.converged && (
          <p className="train-line-page__hint">
            The flow solver did not converge; these figures are its last estimate.
          </p>
        )}
      </section>
    </section>
  );
}
