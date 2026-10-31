import { isString } from './validation.ts';

export type Good = string;

export const Good = {
  isInstance: (value: unknown): value is Good => isString(value),
} as const;
