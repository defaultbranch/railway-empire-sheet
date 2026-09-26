import { useTrainStations } from '../game-state/train-stations-state';
import { stationSlug } from './station-routes';

export function StationPage({ slug }: { slug: string }) {
  const { trainStations } = useTrainStations();
  const station = trainStations.find((existing) => stationSlug(existing) === slug);

  if (station === undefined) {
    return (
      <section className="station-page">
        <p className="station-page__empty">No station found for "{slug}".</p>
      </section>
    );
  }

  return (
    <section className="station-page">
      <h1>{station.name}</h1>
      <p className="station-page__tracks">Tracks: {station.tracks}</p>
    </section>
  );
}
