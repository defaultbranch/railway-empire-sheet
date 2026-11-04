import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'vite';

let server;
let addGameDays;
let recordOnDemandDeparture;
let scheduleOnDemandLine;
let sortDispatchSchedules;

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
  ({ addGameDays, recordOnDemandDeparture, scheduleOnDemandLine, sortDispatchSchedules } =
    await server.ssrLoadModule('/src/app/pages/dispatch-schedule.ts'));
});
after(async () => { await server?.close(); });

const line = (name, lastDispatchDate) => ({
  type: 'OnDemandTrainLine', name,
  stops: [{ kind: 'station', name: 'Origin' }, { kind: 'station', name: 'Destination' }],
  cargo: 'goods', lastDispatchDate,
});

test('calendar arithmetic is UTC-safe across pre-epoch, leap-day, and year boundaries', () => {
  assert.equal(addGameDays('1800-02-28', 1), '1800-03-01');
  assert.equal(addGameDays('2000-02-28', 1), '2000-02-29');
  assert.equal(addGameDays('2000-02-29', 1), '2000-03-01');
  assert.equal(addGameDays('1899-12-31', 1), '1900-01-01');
  assert.equal(addGameDays('2000-01-01', -1), undefined);
});

test('a line with no dispatch history is due now; otherwise intervals round up by weekly wagon flow', () => {
  const today = scheduleOnDemandLine(line('New', undefined), 1, '1800-01-01');
  assert.equal(today.dueDate, '1800-01-01');
  assert.equal(today.nextDeparture, '1800-01-01');

  const interval = scheduleOnDemandLine(line('Used', '2024-02-28'), 15, '2024-03-01');
  assert.equal(interval.dueDate, '2024-03-03');
  assert.equal(interval.nextDeparture, '2024-03-03');
});

test('overdue lines display today but retain due-date urgency for sorting', () => {
  const schedules = sortDispatchSchedules([
    scheduleOnDemandLine(line('Less overdue', '2024-01-15'), 56, '2024-02-01'),
    scheduleOnDemandLine(line('More overdue', '2024-01-01'), 56, '2024-02-01'),
  ]);

  assert.deepEqual(schedules.map(({ line: entry, dueDate, nextDeparture }) => [entry.name, dueDate, nextDeparture]), [
    ['More overdue', '2024-01-02', '2024-02-01'],
    ['Less overdue', '2024-01-16', '2024-02-01'],
  ]);
});

test('zero, unknown, and out-of-range schedules stay distinct and sort after dated lines', () => {
  const schedules = sortDispatchSchedules([
    scheduleOnDemandLine(line('Unknown'), undefined, '2024-01-01'),
    scheduleOnDemandLine(line('Zero'), 0, '2024-01-01'),
    scheduleOnDemandLine(line('Out of range', '0001-01-01'), Number.MIN_VALUE, '9999-12-31'),
    scheduleOnDemandLine(line('Due'), 56, '2024-01-01'),
  ]);

  assert.deepEqual(schedules.map(({ line: entry, status }) => [entry.name, status]), [
    ['Due', 'scheduled'],
    ['Zero', 'zero-flow'],
    ['Unknown', 'unknown-flow'],
    ['Out of range', 'date-out-of-range'],
  ]);
});

test('departure records the current game date without changing other lines', () => {
  const onDemand = line('A to B', '1800-01-01');
  const continuous = { type: 'ContinuousTrainLine', name: 'Loop', stops: [], trains: 1, cargo: 'goods' };
  const updated = recordOnDemandDeparture([onDemand, continuous], 'A to B', '1800-02-28');

  assert.equal(updated[0].lastDispatchDate, '1800-02-28');
  assert.equal(recordOnDemandDeparture([onDemand, continuous], 'A to B', '1800-02-28')[0].lastDispatchDate, '1800-02-28');
  assert.equal(recordOnDemandDeparture([onDemand, continuous], 'A to B', '1800-02-29')[0].lastDispatchDate, '1800-01-01');
  assert.equal(updated[1], continuous);
});
