import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ContinuousTrainLine, GameDate, OnDemandTrainLine, TrainLine } from './index.ts';

const stops = [{ kind: 'station', name: 'A' }, { kind: 'warehouse', name: 'B' }];
const continuous = { type: 'ContinuousTrainLine', name: 'A - B', stops, trains: 1, cargo: 'goods' };
const onDemand = { type: 'OnDemandTrainLine', name: 'A to B', stops, cargo: 'goods' };

test('train line validators distinguish literal type names', () => {
  assert.equal(ContinuousTrainLine.isInstance(continuous), true);
  assert.equal(OnDemandTrainLine.isInstance(onDemand), true);
  assert.equal(TrainLine.isInstance(continuous), true);
  assert.equal(TrainLine.isInstance(onDemand), true);
  assert.equal(ContinuousTrainLine.isInstance(onDemand), false);
  assert.equal(OnDemandTrainLine.isInstance(continuous), false);
  for (const type of [undefined, 'continuous', 'unknown']) {
    assert.equal(TrainLine.isInstance({ ...continuous, type }), false);
  }
});

test('on-demand lines require two valid ordered stops and valid cargo', () => {
  for (const invalidStops of [[], stops.slice(0, 1), [...stops, stops[0]], [stops[0], {}]]) {
    assert.equal(OnDemandTrainLine.isInstance({ ...onDemand, stops: invalidStops }), false);
  }
  assert.equal(OnDemandTrainLine.isInstance({ ...onDemand, cargo: 'invalid' }), false);
});

test('on-demand dates and one-way durations are optional and validated', () => {
  assert.equal(OnDemandTrainLine.isInstance({ ...onDemand, travelDays: 12.5, lastDispatchDate: '1800-01-01' }), true);
  for (const travelDays of [0, -1, Infinity, NaN, '12']) {
    assert.equal(OnDemandTrainLine.isInstance({ ...onDemand, travelDays }), false);
  }
  for (const lastDispatchDate of [null, '1800-02-29', 'yesterday', 0]) {
    assert.equal(OnDemandTrainLine.isInstance({ ...onDemand, lastDispatchDate }), false);
  }
});

test('game dates support pre-epoch dates and reject invalid calendar dates', () => {
  for (const date of ['1800-01-01', '1804-02-29', '1969-12-31', '2000-02-29']) {
    assert.equal(GameDate.isInstance(date), true);
  }
  for (const date of ['1800-02-29', '1900-02-29', '1800-04-31', '1800-13-01', '1800-1-01', '1800-01-01T00:00:00Z', null]) {
    assert.equal(GameDate.isInstance(date), false);
  }
});