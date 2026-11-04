import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'vite';

let server;
let createTrainLineFromForm;

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
  ({ createTrainLineFromForm } = await server.ssrLoadModule('/src/app/pages/train-line-connection-form.tsx'));
});
after(async () => { await server?.close(); });

const stops = [
  { kind: 'station', name: 'Origin' },
  { kind: 'warehouse', name: 'Destination' },
];

const values = (overrides = {}) => ({
  lineType: 'ContinuousTrainLine',
  name: '  Connection  ',
  stops,
  trains: 2,
  tourDays: '14',
  travelDays: '',
  lastDispatchDate: '',
  cargo: 'goods',
  existingLineNames: [],
  ...overrides,
});

test('continuous creation preserves route order and continuous-only fields', () => {
  assert.deepEqual(createTrainLineFromForm(values()), {
    type: 'ContinuousTrainLine',
    name: 'Connection',
    stops,
    trains: 2,
    tourDays: 14,
    cargo: 'goods',
  });
});

test('on-demand creation preserves direction and accepts optional travel and dispatch dates', () => {
  assert.deepEqual(createTrainLineFromForm(values({
    lineType: 'OnDemandTrainLine',
    travelDays: '3.5',
    lastDispatchDate: '1800-01-01',
  })), {
    type: 'OnDemandTrainLine',
    name: 'Connection',
    stops,
    travelDays: 3.5,
    lastDispatchDate: '1800-01-01',
    cargo: 'goods',
  });

  const withoutOptionalFields = createTrainLineFromForm(values({ lineType: 'OnDemandTrainLine' }));
  assert.equal(withoutOptionalFields.travelDays, undefined);
  assert.equal(withoutOptionalFields.lastDispatchDate, undefined);
});

test('on-demand creation rejects invalid optional fields, duplicate names, and identical endpoints', () => {
  assert.equal(createTrainLineFromForm(values({ lineType: 'OnDemandTrainLine', travelDays: '0' })), undefined);
  assert.equal(createTrainLineFromForm(values({ lineType: 'OnDemandTrainLine', travelDays: 'NaN' })), undefined);
  assert.equal(createTrainLineFromForm(values({ lineType: 'OnDemandTrainLine', lastDispatchDate: '1800-02-30' })), undefined);
  assert.equal(createTrainLineFromForm(values({ lineType: 'OnDemandTrainLine', stops: [stops[0], stops[0]] })), undefined);
  assert.equal(createTrainLineFromForm(values({ existingLineNames: ['Connection'] })), undefined);
});
