import { useTrainLines } from '../game-state/train-lines-state';
import { useNavigation } from '../navigation';
import { pathForTrainLine, trainLineSlug } from './train-line-routes';
import { pathForStation } from './station-routes';
import { pathForWarehouse } from './warehouse-routes';
import type { StopRef } from '../game-state/types';
import { useGoodsFlow } from '../solver';
import type { LegId } from '../solver';

const stopLabel = (stop: StopRef) => `${stop.name} (${stop.kind === 'station' ? 'Station' : 'Warehouse'})`;

const stopPath = (stop: StopRef) => (stop.kind === 'station' ? pathForStation(stop) : pathForWarehouse(stop));

const nodeLabel = (node: string) => node.slice(node.indexOf(':') + 1);

const perWeek = (units: number) => units.toLocaleString(undefined, { maximumFractionDigits: 2 });

const utilizationPercent = (units: number, capacity: number) =>
  capacity > 0 ? ((units / capacity) * 100).toLocaleString(undefined, { maximumFractionDigits: 1 }) : '0';

export function TrainLinePage({ slug }: { slug: string }) {
  const { trainLines, convertTrainLine, updateTrainLine } = useTrainLines();
  const { navigate } = useNavigation();
  const { network, solution, droppedLines, revenue } = useGoodsFlow();
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
  const lineRevenue = revenue.lines.find((entry) => entry.line === trainLine.name);
  const currency = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const lineFlows = solution.legFlows.filter((flow) => legs.some((leg) => leg.id === flow.leg));
  const goods = [...new Set([
    ...lineFlows.map((flow) => flow.good),
    ...(lineRevenue?.byGood.map((entry) => entry.good) ?? []),
  ])].sort((left, right) => left.localeCompare(right));
  const unitsByGood = new Map<string, Map<LegId, number>>();
  for (const flow of lineFlows) {
    const byLeg = unitsByGood.get(flow.good) ?? new Map<LegId, number>();
    byLeg.set(flow.leg, flow.units);
    unitsByGood.set(flow.good, byLeg);
  }
  const yieldByGood = new Map(lineRevenue?.byGood.map((entry) => [entry.good, entry.weeklyYield]) ?? []);
  const totalByLeg = new Map(legs.map((leg) => [
    leg.id,
    lineFlows.filter((flow) => flow.leg === leg.id).reduce((sum, flow) => sum + flow.units, 0),
  ]));

  return (
    <section className="train-line-page">
      <h1>{trainLine.name}</h1>
      <button
        type="button"
        onClick={() => convertTrainLine(trainLine.name)}
        disabled={trainLine.stops.length !== 2}
        title={trainLine.stops.length !== 2 ? 'On-demand service requires exactly two stops' : undefined}
      >
        {trainLine.type === 'ContinuousTrainLine' ? 'Convert to on-demand' : 'Convert to continuous'}
      </button>
      <form
        key={`${trainLine.name}-${trainLine.type}-${trainLine.type === 'ContinuousTrainLine' ? `${trainLine.tourDays}-${trainLine.trains}` : trainLine.travelDays}`}
        style={{ display: 'grid', gap: '0.75rem', maxWidth: '24rem', marginBlock: '1rem' }}
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const data = new FormData(form);
          const name = String(data.get('name')).trim();
          const nameInput = form.elements.namedItem('name') as HTMLInputElement;
          const slug = trainLineSlug({ name });
          nameInput.setCustomValidity(!slug ? 'Enter a name containing letters or numbers.'
            : trainLines.some((existing) => existing.name !== trainLine.name && trainLineSlug(existing) === slug)
              ? 'Another train line already uses this name or URL.' : '');
          if (!form.reportValidity()) return;
          const daysValue = String(data.get('days'));
          updateTrainLine(trainLine.name, {
            name,
            days: daysValue === '' ? undefined : Number(daysValue),
            trains: trainLine.type === 'ContinuousTrainLine' ? Number(data.get('trains')) : undefined,
          });
          if (name !== trainLine.name) navigate(pathForTrainLine({ name }));
        }}
      >
        <label style={{ display: 'grid', gap: '0.25rem', minWidth: 0 }}>
          Train name
          <input name="name" required defaultValue={trainLine.name}
            onChange={(event) => event.currentTarget.setCustomValidity('')} style={{ minWidth: 0 }} />
        </label>
        <label style={{ display: 'grid', gap: '0.25rem', minWidth: 0 }}>
          {trainLine.type === 'ContinuousTrainLine' ? 'Tour days' : 'Travel days'}
          <input name="days" type="number" min={0} step="any" placeholder="Unknown"
            defaultValue={trainLine.type === 'ContinuousTrainLine' ? trainLine.tourDays ?? '' : trainLine.travelDays ?? ''}
            onChange={(event) => event.currentTarget.setCustomValidity(
              event.currentTarget.value !== '' && Number(event.currentTarget.value) <= 0 ? 'Duration must be greater than zero.' : '')}
            style={{ minWidth: 0 }} />
        </label>
        {trainLine.type === 'ContinuousTrainLine' && (
          <label style={{ display: 'grid', gap: '0.25rem', minWidth: 0 }}>
            Number of trains
            <input name="trains" type="number" required min={0} max={Number.MAX_SAFE_INTEGER} step={1}
              defaultValue={trainLine.trains} style={{ minWidth: 0 }} />
          </label>
        )}
        <button type="submit">Save changes</button>
      </form>
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
        <h2>Goods carried and weekly yield</h2>
        {dropped !== undefined ? (
          <p className="train-line-page__empty">Not modelled: {dropped.reason}.</p>
        ) : (
          <>
            <p>{trainLine.type === 'ContinuousTrainLine' ? 'Per train' : 'Weekly yield'}: {
              !revenue.journeyTimeKnown ? 'Unknown'
                : trainLine.type === 'ContinuousTrainLine'
                  ? currency.format(lineRevenue?.weeklyYieldPerTrain ?? 0)
                  : currency.format(lineRevenue?.weeklyYield ?? 0)
            } / week</p>
            {!revenue.journeyTimeKnown && (
              <p className="train-line-page__hint">Journey-time revenue and arrival estimates are unavailable for a used line with unknown duration.</p>
            )}
            <table className="train-line-page__table">
              <thead>
                <tr>
                  <th>Good</th>
                  {legs.map((leg, index) => (
                    <th key={leg.id} title={`${nodeLabel(leg.from)} → ${nodeLabel(leg.to)} units per week`}>
                      {index === 0 ? 'Outbound / week' : 'Return / week'}
                    </th>
                  ))}
                  <th>Yield / week</th>
                </tr>
              </thead>
              <tbody>
                {goods.length === 0 ? (
                  <tr><td colSpan={legs.length + 2}>Runs empty.</td></tr>
                ) : goods.map((good) => (
                  <tr key={good}>
                    <td>{good}</td>
                    {legs.map((leg) => (
                      <td key={leg.id}>{perWeek(unitsByGood.get(good)?.get(leg.id) ?? 0)}</td>
                    ))}
                    <td>{revenue.journeyTimeKnown ? currency.format(yieldByGood.get(good) ?? 0) : '—'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th>Total</th>
                  {legs.map((leg) => (
                    <td key={leg.id} title={trainLine.type === 'OnDemandTrainLine'
                      ? 'Solved weekly flow; no fleet capacity limit'
                      : 'Average utilization per train per ride, out of 8 goods'}>
                      <div>{perWeek(totalByLeg.get(leg.id) ?? 0)}{trainLine.type === 'ContinuousTrainLine'
                        ? ` of ${perWeek(leg.capacity)}` : ' / week'}</div>
                    </td>
                  ))}
                  <td>{revenue.journeyTimeKnown ? currency.format(lineRevenue?.weeklyYield ?? 0) : '—'}</td>
                </tr>
                <tr>
                  <th>Utilization</th>
                  {legs.map((leg) => (
                    <td key={leg.id} title={trainLine.type === 'OnDemandTrainLine'
                      ? 'No fleet capacity limit'
                      : 'Average utilization per train per ride, out of 8 goods'}>
                      {trainLine.type === 'ContinuousTrainLine'
                        ? `${utilizationPercent(totalByLeg.get(leg.id) ?? 0, leg.capacity)}%`
                        : '—'}
                    </td>
                  ))}
                  <td>—</td>
                </tr>
              </tfoot>
            </table>
          </>
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
