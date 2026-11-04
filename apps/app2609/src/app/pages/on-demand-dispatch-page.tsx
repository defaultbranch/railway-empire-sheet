import { GameDate } from '../game-state/types';
import { useGameDate, useTrainLines } from '../game-state';
import { useNavigation } from '../navigation';
import { useGoodsFlow } from '../solver';
import { pathForTrainLine } from '../entities/train-line-routes';
import {
  recordOnDemandDeparture,
  scheduleOnDemandLine,
  sortDispatchSchedules,
} from './dispatch-schedule';

const weeklyFlowFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });

export function OnDemandDispatchPage() {
  const { trainLines, replaceTrainLines } = useTrainLines();
  const { gameDate, setGameDate } = useGameDate();
  const { navigate } = useNavigation();
  const { network, solution, droppedLines } = useGoodsFlow();
  const onDemandLines = trainLines.filter((line) => line.type === 'OnDemandTrainLine');
  const onDemandNames = new Set(onDemandLines.map((line) => line.name));
  const flowByLine = new Map<string, number>();
  const lineByLeg = new Map(network.legs.map((leg) => [leg.id, leg.line]));

  for (const flow of solution.legFlows) {
    const lineName = lineByLeg.get(flow.leg);
    if (lineName === undefined || !onDemandNames.has(lineName)) continue;
    flowByLine.set(lineName, (flowByLine.get(lineName) ?? 0) + flow.units);
  }

  const droppedByLine = new Map(droppedLines.map((entry) => [entry.line, entry.reason]));
  const unknownReason = !solution.converged
    ? 'The goods-flow solver did not converge.'
    : solution.missingCoefficients.length > 0
      ? 'Some production coefficients are missing.'
      : undefined;
  const schedules = sortDispatchSchedules(onDemandLines.map((line) => {
    const reason = droppedByLine.get(line.name) ?? unknownReason;
    return scheduleOnDemandLine(line, reason === undefined ? flowByLine.get(line.name) ?? 0 : undefined, gameDate, reason);
  }));

  return (
    <section className="on-demand-dispatch-page">
      <div className="on-demand-dispatch-page__date-control">
        <label htmlFor="on-demand-game-date">Game date</label>
        <input
          id="on-demand-game-date"
          type="date"
          value={gameDate}
          onChange={(event) => {
            if (GameDate.isInstance(event.currentTarget.value)) setGameDate(event.currentTarget.value);
          }}
        />
      </div>
      <div className="on-demand-dispatch-page__table-scroll">
        <table className="on-demand-dispatch-page__table">
          <thead>
            <tr>
              <th scope="col">Line</th>
              <th scope="col">Origin</th>
              <th scope="col">Destination</th>
              <th scope="col">Weekly flow</th>
              <th scope="col">Last departure</th>
              <th scope="col">Next departure</th>
              <th scope="col" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {schedules.length === 0 ? (
              <tr>
                <td colSpan={7} className="on-demand-dispatch-page__empty">No on-demand train lines.</td>
              </tr>
            ) : schedules.map((schedule) => (
              <tr key={schedule.line.name}>
                <td>
                  <a
                    href={pathForTrainLine(schedule.line)}
                    onClick={(event) => {
                      event.preventDefault();
                      navigate(pathForTrainLine(schedule.line));
                    }}
                  >
                    {schedule.line.name}
                  </a>
                </td>
                <td>{schedule.line.stops[0].name}</td>
                <td>{schedule.line.stops[1].name}</td>
                <td title={schedule.reason}>
                  {schedule.weeklyFlow === undefined ? 'Unknown' : weeklyFlowFormat.format(schedule.weeklyFlow)}
                </td>
                <td>{schedule.line.lastDispatchDate ?? '--'}</td>
                <td title={schedule.reason}>
                  {schedule.status === 'scheduled' ? schedule.nextDeparture
                    : schedule.status === 'zero-flow' ? 'No flow'
                      : schedule.status === 'date-out-of-range' ? 'Date out of range' : 'Unknown'}
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => replaceTrainLines(recordOnDemandDeparture(trainLines, schedule.line.name, gameDate))}
                    aria-label={`Record departure for ${schedule.line.name}`}
                  >
                    Departure
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
