import { isOneOf, isOptionalNumber, isRecord } from './validation.ts';

export const businessLevels = [1, 2, 3, 4, 5] as const;
export type BusinessLevel = (typeof businessLevels)[number];

export const BusinessLevel = {
  isInstance: (value: unknown): value is BusinessLevel => isOneOf(value, businessLevels),
} as const;

export function isProductionByLevel(value: unknown): value is Record<BusinessLevel, number | undefined> {
  return isRecord(value) && businessLevels.every((level) => isOptionalNumber(value[level]));
}

export function emptyProductionByLevel(): Record<BusinessLevel, number | undefined> {
  return { 1: undefined, 2: undefined, 3: undefined, 4: undefined, 5: undefined };
}
