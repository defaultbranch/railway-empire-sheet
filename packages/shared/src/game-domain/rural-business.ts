import { Good } from './primitives.ts';
import { BusinessLevel, isProductionByLevel } from './production.ts';
import { isOptionalNumber, isRecord, isString } from './validation.ts';

export type RuralBusinessType = {
  name: string;
  good: Good;
  // per-level production is only known once a business of this type reaches that level
  productionByLevel: Record<BusinessLevel, number | undefined>;
  // baseline acquisition/upgrade cost, calibrated against level-1 weekly production; unknown until surveyed
  setupCostBasis?: number;
};

export const RuralBusinessType = {
  isInstance: (value: unknown): value is RuralBusinessType =>
    isRecord(value) &&
    isString(value.name) &&
    Good.isInstance(value.good) &&
    isProductionByLevel(value.productionByLevel) &&
    isOptionalNumber(value.setupCostBasis),
} as const;

// a concrete, placed instance of a RuralBusinessType: has its own name (distinct from its type's name)
export type RuralBusiness = {
  name: string;
  typeName: string;
  level: BusinessLevel;
};

export const RuralBusiness = {
  isInstance: (value: unknown): value is RuralBusiness =>
    isRecord(value) && isString(value.name) && isString(value.typeName) && BusinessLevel.isInstance(value.level),
} as const;
