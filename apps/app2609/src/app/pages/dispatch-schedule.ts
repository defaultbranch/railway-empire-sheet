import { GameDate, type GameDate as GameDateString, type OnDemandTrainLine, type TrainLine } from '../game-state/types';

export type DispatchSchedule = {
  line: OnDemandTrainLine;
  weeklyFlow: number | undefined;
  dueDate: GameDateString | undefined;
  nextDeparture: GameDateString | undefined;
  status: 'scheduled' | 'zero-flow' | 'unknown-flow' | 'date-out-of-range';
  reason: string | undefined;
};

export function addGameDays(date: GameDateString, days: number): GameDateString | undefined {
  if (!GameDate.isInstance(date) || !Number.isSafeInteger(days) || days < 0) return undefined;

  const result = new Date(`${date}T00:00:00.000Z`);
  result.setUTCDate(result.getUTCDate() + days);
  if (!Number.isFinite(result.getTime())) return undefined;

  const nextDate = result.toISOString().slice(0, 10);
  return GameDate.isInstance(nextDate) ? nextDate : undefined;
}

export function scheduleOnDemandLine(
  line: OnDemandTrainLine,
  weeklyFlow: number | undefined,
  gameDate: GameDateString,
  unknownReason?: string,
): DispatchSchedule {
  const unknown = (reason: string): DispatchSchedule => ({
    line, weeklyFlow, dueDate: undefined, nextDeparture: undefined, status: 'unknown-flow', reason,
  });

  if (unknownReason !== undefined) return unknown(unknownReason);
  if (!GameDate.isInstance(gameDate)) return unknown('Game date is invalid.');
  if (weeklyFlow === undefined || !Number.isFinite(weeklyFlow) || weeklyFlow < 0) {
    return unknown('Weekly flow is unavailable.');
  }
  if (weeklyFlow === 0) {
    return { line, weeklyFlow, dueDate: undefined, nextDeparture: undefined, status: 'zero-flow', reason: undefined };
  }
  if (line.lastDispatchDate !== undefined && !GameDate.isInstance(line.lastDispatchDate)) {
    return unknown('Last departure date is invalid.');
  }

  const intervalDays = Math.ceil((8 * 7) / weeklyFlow);
  if (!Number.isSafeInteger(intervalDays)) {
    return {
      line, weeklyFlow, dueDate: undefined, nextDeparture: undefined,
      status: 'date-out-of-range', reason: 'The dispatch interval exceeds the supported date range.',
    };
  }

  const dueDate = line.lastDispatchDate === undefined
    ? gameDate
    : addGameDays(line.lastDispatchDate, intervalDays);
  if (dueDate === undefined) {
    return {
      line, weeklyFlow, dueDate: undefined, nextDeparture: undefined,
      status: 'date-out-of-range', reason: 'The next departure is outside the supported date range.',
    };
  }

  return {
    line,
    weeklyFlow,
    dueDate,
    nextDeparture: dueDate < gameDate ? gameDate : dueDate,
    status: 'scheduled',
    reason: undefined,
  };
}

export function sortDispatchSchedules(schedules: DispatchSchedule[]): DispatchSchedule[] {
  const unscheduledOrder = { 'zero-flow': 0, 'unknown-flow': 1, 'date-out-of-range': 2, scheduled: -1 } as const;
  return [...schedules].sort((first, second) => {
    if (first.nextDeparture !== undefined && second.nextDeparture !== undefined) {
      return first.nextDeparture.localeCompare(second.nextDeparture) ||
        (first.dueDate ?? '').localeCompare(second.dueDate ?? '') ||
        first.line.name.localeCompare(second.line.name);
    }
    if (first.nextDeparture !== undefined) return -1;
    if (second.nextDeparture !== undefined) return 1;
    return unscheduledOrder[first.status] - unscheduledOrder[second.status] ||
      first.line.name.localeCompare(second.line.name);
  });
}

export function recordOnDemandDeparture(
  trainLines: TrainLine[],
  lineName: string,
  gameDate: GameDateString,
): TrainLine[] {
  if (!GameDate.isInstance(gameDate)) return trainLines;
  return trainLines.map((line) => line.name === lineName && line.type === 'OnDemandTrainLine'
    ? { ...line, lastDispatchDate: gameDate }
    : line);
}
