function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isOptionalNumber(value: unknown): value is number | undefined {
  return value === undefined || isNumber(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isArrayOf<T>(value: unknown, isItem: (item: unknown) => item is T): value is T[] {
  return Array.isArray(value) && value.every(isItem);
}

function isOneOf<T>(value: unknown, allowed: readonly T[]): value is T {
  return (allowed as readonly unknown[]).includes(value);
}

export type Good = string;

export const Good = {
  isInstance: (value: unknown): value is Good => isString(value),
} as const;

export const businessLevels = [1, 2, 3, 4, 5] as const;
export type BusinessLevel = (typeof businessLevels)[number];

export const BusinessLevel = {
  isInstance: (value: unknown): value is BusinessLevel => isOneOf(value, businessLevels),
} as const;

function isProductionByLevel(value: unknown): value is Record<BusinessLevel, number | undefined> {
  return isRecord(value) && businessLevels.every((level) => isOptionalNumber(value[level]));
}

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

// exclusive: a stop is hosted by either a single city, or by 1-2 rural businesses
export type StopHost =
  | { kind: 'city'; city: string }
  | { kind: 'ruralBusinesses'; ruralBusinesses: [string] | [string, string] };

export const StopHost = {
  isInstance: (value: unknown): value is StopHost => {
    if (!isRecord(value)) return false;
    if (value.kind === 'city') return isString(value.city);
    if (value.kind === 'ruralBusinesses') {
      return (
        Array.isArray(value.ruralBusinesses) &&
        (value.ruralBusinesses.length === 1 || value.ruralBusinesses.length === 2) &&
        value.ruralBusinesses.every(isString)
      );
    }
    return false;
  },
} as const;

export const stationTrackCounts = [1, 2, 4] as const;
export type StationTrackCount = (typeof stationTrackCounts)[number];

export const StationTrackCount = {
  isInstance: (value: unknown): value is StationTrackCount => isOneOf(value, stationTrackCounts),
} as const;

export type TrainStation = {
  name: string; // defaults to the connected city/business name, but freely editable
  tracks: StationTrackCount;
  host: StopHost;
};

export const TrainStation = {
  isInstance: (value: unknown): value is TrainStation =>
    isRecord(value) &&
    isString(value.name) &&
    StationTrackCount.isInstance(value.tracks) &&
    StopHost.isInstance(value.host),
} as const;

export const warehouseTrackCounts = [2, 4] as const;
export type WarehouseTrackCount = (typeof warehouseTrackCounts)[number];

export const WarehouseTrackCount = {
  isInstance: (value: unknown): value is WarehouseTrackCount => isOneOf(value, warehouseTrackCounts),
} as const;

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

export const Warehouse = {
  isInstance: (value: unknown): value is Warehouse =>
    isRecord(value) &&
    isString(value.name) &&
    WarehouseTrackCount.isInstance(value.tracks) &&
    StopHost.isInstance(value.host) &&
    isArrayOf(value.goods, Good.isInstance),
} as const;

export type StopRef = { kind: 'station'; name: string } | { kind: 'warehouse'; name: string };

export const StopRef = {
  isInstance: (value: unknown): value is StopRef =>
    isRecord(value) && (value.kind === 'station' || value.kind === 'warehouse') && isString(value.name),
} as const;

// what a train line is configured to carry
export const trainCargoTypes = ['anything', 'goods', 'mail and passengers'] as const;
export type TrainCargo = (typeof trainCargoTypes)[number];

export const TrainCargo = {
  isInstance: (value: unknown): value is TrainCargo => isOneOf(value, trainCargoTypes),
} as const;

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

export const TrainLine = {
  isInstance: (value: unknown): value is TrainLine =>
    isRecord(value) &&
    isString(value.name) &&
    isArrayOf(value.stops, StopRef.isInstance) &&
    isNumber(value.trains) &&
    isOptionalNumber(value.tourDays) &&
    TrainCargo.isInstance(value.cargo),
} as const;

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

export const GameState = {
  isInstance: (value: unknown): value is GameState =>
    isRecord(value) &&
    isArrayOf(value.goods, Good.isInstance) &&
    isArrayOf(value.ruralBusinessTypes, RuralBusinessType.isInstance) &&
    isArrayOf(value.industryTypes, IndustryType.isInstance) &&
    isArrayOf(value.demands, Demand.isInstance) &&
    isArrayOf(value.cities, City.isInstance) &&
    isArrayOf(value.ruralBusinesses, RuralBusiness.isInstance) &&
    isArrayOf(value.industries, Industry.isInstance) &&
    isArrayOf(value.trainStations, TrainStation.isInstance) &&
    isArrayOf(value.warehouses, Warehouse.isInstance) &&
    isArrayOf(value.trainLines, TrainLine.isInstance),
} as const;

export function emptyProductionByLevel(): Record<BusinessLevel, number | undefined> {
  return { 1: undefined, 2: undefined, 3: undefined, 4: undefined, 5: undefined };
}

export function emptyGoodFlow(): GoodFlow {
  return { good: undefined, amountByLevel: emptyProductionByLevel() };
}
