import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'vite';

let server;
let deserializeGameState;
let serializeGameState;
let defaultGameState;
let emptyGameState;
let GameState;

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
  ({ deserializeGameState, serializeGameState } = await server.ssrLoadModule('/src/app/game-state/persistence.ts'));
  ({ defaultGameState, emptyGameState } = await server.ssrLoadModule('/src/app/initial-state.ts'));
  ({ GameState } = await server.ssrLoadModule('/src/app/game-state/types.ts'));
});
after(async () => { await server?.close(); });

const legacyLine = {
  name: 'A - B',
  stops: [{ kind: 'station', name: 'A' }, { kind: 'warehouse', name: 'B' }],
  trains: 1,
  tourDays: 20,
  cargo: 'goods',
};
const onDemandLine = {
  type: 'OnDemandTrainLine',
  name: 'A to B',
  stops: [{ kind: 'station', name: 'A' }, { kind: 'warehouse', name: 'B' }],
  travelDays: 4,
  lastDispatchDate: '1800-01-01',
  cargo: 'anything',
};

test('default lines have their literal discriminator and round-trip through persistence', () => {
  const state = defaultGameState();
  assert.ok(state.trainLines.length > 0);
  assert.ok(state.trainLines.every((line) => line.type === 'ContinuousTrainLine'));
  assert.equal(GameState.isInstance(state), true);
  const serialized = serializeGameState(state);
  assert.deepEqual(deserializeGameState(serialized), JSON.parse(serialized).state);
});

test('both train-line variants and the game date round-trip through persistence', () => {
  const state = { ...emptyGameState(), gameDate: '1800-01-01', trainLines: [
    { ...legacyLine, type: 'ContinuousTrainLine' }, onDemandLine,
  ] };
  const restored = deserializeGameState(serializeGameState(state));
  assert.deepEqual(restored, state);
  assert.equal(GameState.isInstance(state), true);
});

test('legacy saved and imported lines gain the continuous discriminator without losing fields', () => {
  const state = { ...emptyGameState(), trainLines: [legacyLine] };
  delete state.gameDate;
  assert.equal(GameState.isInstance(state), false);
  const loaded = deserializeGameState(JSON.stringify({ version: 1, state }));
  assert.deepEqual(loaded, { ...state, gameDate: '1830-01-01', trainLines: [{ ...legacyLine, type: 'ContinuousTrainLine' }] });
  assert.equal(GameState.isInstance(loaded), true);
  assert.deepEqual(deserializeGameState(serializeGameState(loaded)), loaded);
});

test('loading rejects unknown types, malformed lines and invalid game dates', () => {
  const { trains, tourDays, ...onDemandFields } = legacyLine;
  for (const line of [
    { ...legacyLine, type: 'unknown' },
    { ...legacyLine, trains: '1' },
    { ...onDemandFields, type: 'OnDemandTrainLine', stops: [{ kind: 'station', name: 'A' }], lastDispatchDate: '1800-01-01' },
  ]) {
    const state = { ...emptyGameState(), trainLines: [line] };
    assert.equal(deserializeGameState(JSON.stringify({ version: 1, state })), undefined);
  }
  assert.equal(deserializeGameState(JSON.stringify({ version: 1, state: { ...emptyGameState(), gameDate: '1800-02-30' } })), undefined);
  assert.equal(deserializeGameState('{'), undefined);
  assert.equal(deserializeGameState(JSON.stringify({ version: 2, state: emptyGameState() })), undefined);
});

test('demand samples round-trip, old saves remain valid and malformed samples are rejected', () => {
  const state = emptyGameState();
  assert.ok(deserializeGameState(serializeGameState(state)));
  const sample = { id: 'one', city: 'A', population: 100_000, observations: [{ good: 'Grain', total: 12, industry: 2 }] };
  state.demandSamples = [sample];
  assert.deepEqual(deserializeGameState(serializeGameState(state)).demandSamples, [sample]);
  state.demandSamples = [{ ...sample, population: -1 }];
  assert.equal(deserializeGameState(serializeGameState(state)), undefined);
});
