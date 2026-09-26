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
  city: string;
  citySlot: IndustrySlot;
  typeName: string;
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

// exclusive: a stop is hosted by either a single city, or by 1-2 rural businesses
export type StopHost =
  | { kind: 'city'; city: string }
  | { kind: 'ruralBusinesses'; ruralBusinesses: [string] | [string, string] };

export const stationTrackCounts = [1, 2, 4] as const;
export type StationTrackCount = (typeof stationTrackCounts)[number];

export type TrainStation = {
  name: string; // defaults to the connected city/business name, but freely editable
  tracks: StationTrackCount;
  host: StopHost;
};

export const warehouseTrackCounts = [2, 4] as const;
export type WarehouseTrackCount = (typeof warehouseTrackCounts)[number];

// max distinct goods a warehouse can stock, keyed by track count
export const warehouseGoodSlotsByTracks: Record<WarehouseTrackCount, number> = {
  2: 3,
  4: 6,
};

export type Warehouse = {
  name: string;
  tracks: WarehouseTrackCount;
  host: StopHost;
  goods: Good[]; // length should not exceed warehouseGoodSlotsByTracks[tracks]
};

export type StopRef = { kind: 'station'; name: string } | { kind: 'warehouse'; name: string };

// what a train line is configured to carry
export const trainCargoTypes = ['anything', 'goods', 'mail and passengers'] as const;
export type TrainCargo = (typeof trainCargoTypes)[number];

// an ordered, looping route: after the last stop, the train returns to the first
// trains: how many identical trains (each up to 8 wagons) run this route concurrently
// tourDays: how many days a train takes to complete the full loop, once known
export type TrainLine = {
  name: string;
  stops: StopRef[];
  trains: number;
  tourDays?: number;
  cargo: TrainCargo;
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
  trainStations: TrainStation[];
  warehouses: Warehouse[];
  trainLines: TrainLine[];
};

export function emptyProductionByLevel(): Record<BusinessLevel, number | undefined> {
  return { 1: undefined, 2: undefined, 3: undefined, 4: undefined, 5: undefined };
}

export function emptyGoodFlow(): GoodFlow {
  return { good: undefined, amountByLevel: emptyProductionByLevel() };
}
