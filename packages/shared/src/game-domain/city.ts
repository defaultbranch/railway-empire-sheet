import { Good } from './primitives.ts';
import { isNumber, isRecord, isString } from './validation.ts';

// population demand for a good: not demanded below minPopulation, then wagonsPerMillion per week per million citizens
export type Demand = {
  good: Good;
  minPopulation: number;
  wagonsPerMillion: number;
};

export const Demand = {
  isInstance: (value: unknown): value is Demand =>
    isRecord(value) &&
    Good.isInstance(value.good) &&
    isNumber(value.minPopulation) &&
    isNumber(value.wagonsPerMillion),
} as const;

// a discovered city: population drives both its demands (via Demand) and how many industries it can host
export type City = {
  name: string;
  population: number;
};

export const City = {
  isInstance: (value: unknown): value is City => isRecord(value) && isString(value.name) && isNumber(value.population),
} as const;
