import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'vite';

let server;
let convertTrainLineService;
let updateTrainLineDetails;
let TrainLine;

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
  ({ convertTrainLineService, updateTrainLineDetails } = await server.ssrLoadModule('/src/app/game-state/train-lines-state.tsx'));
  ({ TrainLine } = await server.ssrLoadModule('/src/app/game-state/types.ts'));
});
after(async () => { await server?.close(); });

const stops = [{ kind: 'station', name: 'Origin' }, { kind: 'warehouse', name: 'Destination' }];
const continuous = {
  type: 'ContinuousTrainLine', name: 'Connection', stops, cargo: 'goods', trains: 3, tourDays: 14,
};

test('continuous conversion preserves direction and cargo and halves the round-trip duration', () => {
  const converted = convertTrainLineService(continuous);
  assert.deepEqual(converted, {
    type: 'OnDemandTrainLine', name: 'Connection', stops, cargo: 'goods', travelDays: 7,
  });
  assert.ok(TrainLine.isInstance(converted));
  assert.equal(continuous.trains, 3);
});

test('on-demand conversion doubles travel duration and starts with one train', () => {
  const converted = convertTrainLineService({
    type: 'OnDemandTrainLine', name: 'Connection', stops, cargo: 'goods', travelDays: 3.5,
    lastDispatchDate: '1830-01-01',
  });
  assert.deepEqual(converted, { ...continuous, trains: 1, tourDays: 7 });
  assert.ok(TrainLine.isInstance(converted));
});

test('conversion preserves unknown durations and does not create invalid zero travel times', () => {
  for (const tourDays of [undefined, 0]) {
    const onDemand = convertTrainLineService({ ...continuous, tourDays });
    assert.equal(onDemand.travelDays, undefined);
    assert.ok(TrainLine.isInstance(onDemand));
    const converted = convertTrainLineService(onDemand);
    assert.equal(converted.tourDays, undefined);
    assert.ok(TrainLine.isInstance(converted));
  }
});

test('continuous routes without exactly two stops cannot be converted', () => {
  for (const route of [[], [stops[0]], [...stops, stops[0]]]) {
    assert.equal(convertTrainLineService({ ...continuous, stops: route }), undefined);
  }
});

test('editing continuous details preserves the route and updates name, tour days and fleet size', () => {
  const other = { ...continuous, name: 'Other' };
  const updated = updateTrainLineDetails([continuous, other], continuous.name, { name: ' Renamed ', days: 5.5, trains: 2 });
  assert.deepEqual(updated[0], { ...continuous, name: 'Renamed', tourDays: 5.5, trains: 2 });
  assert.equal(updated[1], other);
  assert.equal(continuous.name, 'Connection');
  assert.ok(TrainLine.isInstance(updated[0]));
});

test('editing on-demand details preserves dispatch state and allows an unknown duration', () => {
  const line = { type: 'OnDemandTrainLine', name: 'Connection', stops, cargo: 'goods', travelDays: 7, lastDispatchDate: '1830-01-01' };
  const updated = updateTrainLineDetails([line], line.name, { name: 'Renamed', days: 2.5 });
  assert.deepEqual(updated[0], { ...line, name: 'Renamed', travelDays: 2.5 });
  const cleared = updateTrainLineDetails(updated, 'Renamed', { name: 'Renamed' });
  assert.equal(cleared[0].travelDays, undefined);
  assert.ok(TrainLine.isInstance(cleared[0]));
  const continuousCleared = updateTrainLineDetails([continuous], continuous.name, { name: continuous.name, trains: 0 });
  assert.equal(continuousCleared[0].tourDays, undefined);
  assert.equal(continuousCleared[0].trains, 0);
});

test('invalid details and names with conflicting URLs leave state unchanged', () => {
  const lines = [continuous, { ...continuous, name: 'Other Line' }];
  for (const name of ['', '   ', '!!!', 'other-line', 'Other Line']) {
    assert.equal(updateTrainLineDetails(lines, continuous.name, { name, trains: 1 }), lines);
  }
  for (const days of [0, -1, Infinity, NaN]) {
    assert.equal(updateTrainLineDetails(lines, continuous.name, { name: continuous.name, days, trains: 1 }), lines);
  }
  for (const trains of [undefined, -1, 1.5, Infinity, NaN]) {
    assert.equal(updateTrainLineDetails(lines, continuous.name, { name: continuous.name, trains }), lines);
  }
  assert.equal(updateTrainLineDetails(lines, 'Missing', { name: 'New', trains: 1 }), lines);
});
