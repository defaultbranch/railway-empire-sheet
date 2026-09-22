export type Good = string;

export const businessLevels = [1, 2, 3, 4, 5] as const;
export type BusinessLevel = (typeof businessLevels)[number];

export type RuralBusinessType = {
  name: string;
  good: Good;
  // per-level production is only known once a business of this type reaches that level
  productionByLevel: Record<BusinessLevel, number | undefined>;
  // baseline acquisition/upgrade cost, calibrated against level-1 weekly production; unknown until surveyed
  setupCostBasis?: number;
};

// a concrete, placed instance of a RuralBusinessType: has its own name (distinct from its type's name)
export type RuralBusiness = {
  name: string;
  typeName: string;
  level: BusinessLevel;
};

// one raw-material or product entry of an industry type's recipe
export type GoodFlow = {
  good: Good | undefined;
  amountByLevel: Record<BusinessLevel, number | undefined>;
};

export type IndustryFlowField = 'rawMaterials' | 'products';

export type IndustryType = {
  name: string;
  // one or two entries, per the game's recipes
  rawMaterials: GoodFlow[];
  products: GoodFlow[];
  // baseline acquisition/upgrade cost, calibrated against level-1 weekly production; unknown until surveyed
  setupCostBasis?: number;
};

export const industrySlots = [0, 1, 2] as const;
export type IndustrySlot = (typeof industrySlots)[number];

// a concrete, placed instance of an IndustryType, hosted at one of a city's industry slots
export type Industry = {
  name: string;
  typeName: string;
  city: string;
  citySlot: IndustrySlot;
  level: BusinessLevel;
};

// population demand for a good: not demanded below minPopulation, then wagonsPerMillion per week per million citizens
export type Demand = {
  good: Good;
  minPopulation: number;
  wagonsPerMillion: number;
};

// a discovered city: population drives both its demands (via Demand) and how many industries it can host
export type City = {
  name: string;
  population: number;
};

// combined shape used only by the initial-state loader; each dimension is otherwise stored independently
export type GameState = {
  goods: Good[];
  ruralBusinessTypes: RuralBusinessType[];
  industryTypes: IndustryType[];
  demands: Demand[];
  cities: City[];
  ruralBusinesses: RuralBusiness[];
  industries: Industry[];
};

export function emptyProductionByLevel(): Record<BusinessLevel, number | undefined> {
  return { 1: undefined, 2: undefined, 3: undefined, 4: undefined, 5: undefined };
}

export function emptyGoodFlow(): GoodFlow {
  return { good: undefined, amountByLevel: emptyProductionByLevel() };
}
