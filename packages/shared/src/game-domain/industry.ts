import { Good } from './good.ts';
import { BusinessLevel, emptyProductionByLevel, isProductionByLevel } from './production.ts';
import { isArrayOf, isOptionalNumber, isOneOf, isRecord, isString } from './validation.ts';

// one raw-material or product entry of an industry type's recipe
export type GoodFlow = {
  good: Good | undefined;
  amountByLevel: Record<BusinessLevel, number | undefined>;
};

export const GoodFlow = {
  isInstance: (value: unknown): value is GoodFlow =>
    isRecord(value) &&
    (value.good === undefined || Good.isInstance(value.good)) &&
    isProductionByLevel(value.amountByLevel),
} as const;

export type IndustryFlowField = 'rawMaterials' | 'products';

export type IndustryType = {
  name: string;
  // one or two entries, per the game's recipes
  rawMaterials: GoodFlow[];
  products: GoodFlow[];
  // baseline acquisition/upgrade cost, calibrated against level-1 weekly production; unknown until surveyed
  setupCostBasis?: number;
};

export const IndustryType = {
  isInstance: (value: unknown): value is IndustryType =>
    isRecord(value) &&
    isString(value.name) &&
    isArrayOf(value.rawMaterials, GoodFlow.isInstance) &&
    isArrayOf(value.products, GoodFlow.isInstance) &&
    isOptionalNumber(value.setupCostBasis),
} as const;

export const industrySlots = [0, 1, 2] as const;
export type IndustrySlot = (typeof industrySlots)[number];

export const IndustrySlot = {
  isInstance: (value: unknown): value is IndustrySlot => isOneOf(value, industrySlots),
} as const;

// a concrete, placed instance of an IndustryType, hosted at one of a city's industry slots
export type Industry = {
  city: string;
  citySlot: IndustrySlot;
  typeName: string;
  level: BusinessLevel;
};

export const Industry = {
  isInstance: (value: unknown): value is Industry =>
    isRecord(value) &&
    isString(value.city) &&
    IndustrySlot.isInstance(value.citySlot) &&
    isString(value.typeName) &&
    BusinessLevel.isInstance(value.level),
} as const;

export function emptyGoodFlow(): GoodFlow {
  return { good: undefined, amountByLevel: emptyProductionByLevel() };
}
