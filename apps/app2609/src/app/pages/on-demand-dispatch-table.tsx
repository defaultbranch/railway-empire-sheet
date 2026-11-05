import { GameDate, type OnDemandTrainLine, type StopRef } from '../game-state/types';
import { useGameDate, useTrainLines } from '../game-state';
import { useNavigation } from '../navigation';
import { useGoodsFlow } from '../solver';
import { pathForTrainLine } from '../entities/train-line-routes';
import { pathForStation } from '../entities/station-routes';
import { pathForWarehouse } from '../entities/warehouse-routes';
import {
  recordOnDemandDeparture,
  scheduleOnDemandLine,
  sortDispatchSchedules,
} from './dispatch-schedule';

const weeklyFlowFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });
const weeklyYieldFormat = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const pathForStop = (stop: StopRef) =>
  stop.kind === 'station' ? pathForStation(stop) : pathForWarehouse(stop);

export function OnDemandDispatchTable({ stop }: { stop?: StopRef }) {
  const { trainLines, replaceTrainLines } = useTrainLines();
  const { gameDate, setGameDate } = useGameDate();
  const { navigate } = useNavigation();
  const { network, solution, droppedLines, revenue } = useGoodsFlow();
  const onDemandLines = trainLines.filter((line): line is OnDemandTrainLine => line.type === 'OnDemandTrainLine' && (
    stop === undefined || line.stops.some((lineStop) => lineStop.kind === stop.kind && lineStop.name === stop.name)
  ));
  const onDemandNames = new Set(onDemandLines.map((line) => line.name));
  const flowByLine = new Map<string, number>();
  const lineByLeg = new Map(network.legs.map((leg) => [leg.id, leg.line]));

  for (const flow of solution.legFlows) {
    const lineName = lineByLeg.get(flow.leg);
    if (lineName === undefined || !onDemandNames.has(lineName)) continue;
    flowByLine.set(lineName, (flowByLine.get(lineName) ?? 0) + flow.units);
  }

  const droppedByLine = new Map(droppedLines.map((entry) => [entry.line, entry.reason]));
  const revenueByLine = new Map(revenue.lines.map((entry) => [entry.line, entry.weeklyYield]));
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
    <div className="on-demand-dispatch-page">
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
              <th scope="col" title="Total attributed yield for this on-demand line">Yield / week</th>
              <th scope="col">Last departure</th>
              <th scope="col">Next departure</th>
              <th scope="col" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {schedules.length === 0 ? (
              <tr>
                <td colSpan={8} className="on-demand-dispatch-page__empty">
                  {stop === undefined ? 'No on-demand train lines.' : 'No on-demand train lines connect here.'}
                </td>
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
                {schedule.line.stops.map((lineStop) => (
                  <td key={`${lineStop.kind}-${lineStop.name}`}>
                    <a
                      href={pathForStop(lineStop)}
                      onClick={(event) => {
                        event.preventDefault();
                        navigate(pathForStop(lineStop));
                      }}
                    >
                      {lineStop.name}
                    </a>
                  </td>
                ))}
                <td title={schedule.reason}>
                  {schedule.weeklyFlow === undefined ? 'Unknown' : weeklyFlowFormat.format(schedule.weeklyFlow)}
                </td>
                <td title={droppedByLine.get(schedule.line.name)}>
                  {droppedByLine.has(schedule.line.name) ? 'Not modelled'
                    : !revenue.journeyTimeKnown ? 'Unknown'
                      : weeklyYieldFormat.format(revenueByLine.get(schedule.line.name) ?? 0)}
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
    </div>
  );
}
