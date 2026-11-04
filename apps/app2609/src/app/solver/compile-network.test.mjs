import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'vite';

let server;
let solveGoodsFlow;
let compileFlowNetwork;
let emptyGameState;

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
  ({ solveGoodsFlow } = await server.ssrLoadModule('/src/app/solver/solve-goods-flow.ts'));
  ({ compileFlowNetwork } = await server.ssrLoadModule('/src/app/solver/compile-network.ts'));
  ({ emptyGameState } = await server.ssrLoadModule('/src/app/initial-state.ts'));
});
after(async () => { await server?.close(); });

const connectedState = (line) => {
  const state = emptyGameState();
  state.goods = ['Grain'];
  state.demands = [{ good: 'Grain', minPopulation: 0, wagonsPerMillion: 28 }];
  state.cities = [{ name: 'Town', population: 1_000_000 }];
  state.ruralBusinessTypes = [{ name: 'Farm', good: 'Grain', productionByLevel: { 1: 28 } }];
  state.ruralBusinesses = [{ name: 'Farm', typeName: 'Farm', level: 1 }];
  state.trainStations = [
    { name: 'Farm', host: { kind: 'ruralBusinesses', ruralBusinesses: ['Farm'] }, tracks: 1 },
    { name: 'Town', host: { kind: 'city', city: 'Town' }, tracks: 1 },
  ];
  state.trainLines = [line];
  return state;
};

const onDemandLine = {
    type: 'OnDemandTrainLine',
    name: 'A to B',
    stops: [{ kind: 'station', name: 'Farm' }, { kind: 'station', name: 'Town' }],
    cargo: 'goods',
};

test('city stations load only locally produced goods, not population purchases', () => {
  const state = connectedState(onDemandLine);
  const town = (network) => network.nodes.find((node) => node.id === 'station:Town');
  const consumer = town(compileFlowNetwork(state).network);
  assert.deepEqual([...consumer.unloadableGoods], ['Grain']);
  assert.deepEqual([...consumer.loadableGoods], []);

  state.industryTypes = [{ name: 'Grain producer', rawMaterials: [],
    products: [{ good: 'Grain', amountByLevel: { 1: 56 } }] }];
  state.industries = [{ city: 'Town', citySlot: 0, typeName: 'Grain producer', level: 1 }];
  assert.deepEqual([...town(compileFlowNetwork(state).network).loadableGoods], ['Grain']);
});

test('compiled city stations cannot relay farm deliveries to another city', () => {
  const state = connectedState(onDemandLine);
  state.cities.push({ name: 'Other town', population: 1_000_000 });
  state.trainStations.push({ name: 'Other town', host: { kind: 'city', city: 'Other town' }, tracks: 1 });
  state.trainLines.push({ ...onDemandLine, name: 'Town to other town',
    stops: [{ kind: 'station', name: 'Town' }, { kind: 'station', name: 'Other town' }] });
  const { solution } = solveGoodsFlow(state);
  assert.equal(solution.converged, true);
  assert.equal(solution.legFlows.some((flow) => flow.leg.startsWith('Town to other town@')), false);
  assert.equal(solution.contributorFlows.find((flow) =>
    flow.contributor.kind === 'population' && flow.contributor.city === 'Other town').served, 0);
});

test('on-demand lines compile to one directed leg without travel duration', () => {
  const { network, droppedLines } = compileFlowNetwork(connectedState(onDemandLine));

  assert.deepEqual(network.legs.map(({ id, from, to }) => ({ id, from, to })), [
    { id: 'A to B@0', from: 'station:Farm', to: 'station:Town' },
  ]);
  assert.equal(network.legs[0].capacity, 28);
  assert.deepEqual(droppedLines, []);
});

test('on-demand flow is solved from supply and demand and is independent of dispatch duration', () => {
  const solve = (line) => solveGoodsFlow(connectedState(line));
  const withoutDuration = solve(onDemandLine);
  const withDuration = solve({ ...onDemandLine, travelDays: 9, lastDispatchDate: '1800-01-01' });
  const totalFlow = (result) => result.solution.legFlows.reduce((sum, flow) => sum + flow.units, 0);

  assert.equal(withoutDuration.solution.converged, true);
  assert.ok(Math.abs(totalFlow(withoutDuration) - 28) < 1e-4);
  assert.equal(totalFlow(withDuration), totalFlow(withoutDuration));
  assert.deepEqual(withoutDuration.droppedLines, []);
});

test('continuous capacities and return legs remain unchanged', () => {
  const state = connectedState({
    type: 'ContinuousTrainLine',
    name: 'Loop',
    stops: onDemandLine.stops,
    trains: 2,
    tourDays: 14,
    cargo: 'goods',
  });
  const { network } = compileFlowNetwork(state);

  assert.deepEqual(network.legs.map(({ id, from, to, capacity }) => ({ id, from, to, capacity })), [
    { id: 'Loop@0', from: 'station:Farm', to: 'station:Town', capacity: 8 },
    { id: 'Loop@1', from: 'station:Town', to: 'station:Farm', capacity: 8 },
  ]);
});

test('on-demand lines with unsupported cargo remain explicitly dropped', () => {
  const { network, droppedLines } = compileFlowNetwork(connectedState({ ...onDemandLine, cargo: 'mail and passengers' }));

  assert.deepEqual(network.legs, []);
  assert.deepEqual(droppedLines, [{ line: 'A to B', reason: 'carries no goods' }]);
});
