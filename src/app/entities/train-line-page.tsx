import { useTrainLines } from '../game-state/train-lines-state';
import { useNavigation } from '../navigation';
import { trainLineSlug } from './train-line-routes';
import { pathForStation } from './station-routes';
import { pathForWarehouse } from './warehouse-routes';
import type { StopRef } from '../game-state/types';

const stopLabel = (stop: StopRef) => `${stop.name} (${stop.kind === 'station' ? 'Station' : 'Warehouse'})`;

const stopPath = (stop: StopRef) => (stop.kind === 'station' ? pathForStation(stop) : pathForWarehouse(stop));

export function TrainLinePage({ slug }: { slug: string }) {
  const { trainLines } = useTrainLines();
  const { navigate } = useNavigation();
  const trainLine = trainLines.find((existing) => trainLineSlug(existing) === slug);

  if (trainLine === undefined) {
    return (
      <section className="train-line-page">
        <p className="train-line-page__empty">No train line found for "{slug}".</p>
      </section>
    );
  }

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
    </section>
  );
}
