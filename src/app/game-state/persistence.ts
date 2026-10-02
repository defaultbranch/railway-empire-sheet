// Robust (de)serialization of GameState to/from localStorage: validates shape rather than trusting a cast,
// since stored JSON can predate schema changes or be edited/corrupted outside the app.
import {
  businessLevels,
  industrySlots,
  stationTrackCounts,
  trainCargoTypes,
  warehouseTrackCounts,
  type BusinessLevel,
  type City,
  type Demand,
  type GameState,
  type Good,
  type GoodFlow,
  type Industry,
  type IndustrySlot,
  type IndustryType,
  type RuralBusiness,
  type RuralBusinessType,
  type StationTrackCount,
  type StopHost,
  type StopRef,
  type TrainCargo,
  type TrainLine,
  type TrainStation,
  type Warehouse,
  type WarehouseTrackCount,
} from './types';

const STORAGE_KEY = 'railway-empire-sheet:game-state';
const STORAGE_VERSION = 1;

export type StoredGameState = {
  version: typeof STORAGE_VERSION;
  state: GameState;
};

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

function isGood(value: unknown): value is Good {
  return isString(value);
}

function isBusinessLevel(value: unknown): value is BusinessLevel {
  return isOneOf(value, businessLevels);
}

function isProductionByLevel(value: unknown): value is Record<BusinessLevel, number | undefined> {
  return isRecord(value) && businessLevels.every((level) => isOptionalNumber(value[level]));
}

function isRuralBusinessType(value: unknown): value is RuralBusinessType {
  return (
    isRecord(value) &&
    isString(value.name) &&
    isGood(value.good) &&
    isProductionByLevel(value.productionByLevel) &&
    isOptionalNumber(value.setupCostBasis)
  );
}

function isRuralBusiness(value: unknown): value is RuralBusiness {
  return isRecord(value) && isString(value.name) && isString(value.typeName) && isBusinessLevel(value.level);
}

function isGoodFlow(value: unknown): value is GoodFlow {
  return (
    isRecord(value) &&
    (value.good === undefined || isGood(value.good)) &&
    isProductionByLevel(value.amountByLevel)
  );
}

function isIndustryType(value: unknown): value is IndustryType {
  return (
    isRecord(value) &&
    isString(value.name) &&
    isArrayOf(value.rawMaterials, isGoodFlow) &&
    isArrayOf(value.products, isGoodFlow) &&
    isOptionalNumber(value.setupCostBasis)
  );
}

function isIndustrySlot(value: unknown): value is IndustrySlot {
  return isOneOf(value, industrySlots);
}

function isIndustry(value: unknown): value is Industry {
  return (
    isRecord(value) &&
    isString(value.city) &&
    isIndustrySlot(value.citySlot) &&
    isString(value.typeName) &&
    isBusinessLevel(value.level)
  );
}

function isDemand(value: unknown): value is Demand {
  return (
    isRecord(value) && isGood(value.good) && isNumber(value.minPopulation) && isNumber(value.wagonsPerMillion)
  );
}

function isCity(value: unknown): value is City {
  return isRecord(value) && isString(value.name) && isNumber(value.population);
}

function isStopHost(value: unknown): value is StopHost {
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
}

function isStationTrackCount(value: unknown): value is StationTrackCount {
  return isOneOf(value, stationTrackCounts);
}

function isTrainStation(value: unknown): value is TrainStation {
  return (
    isRecord(value) && isString(value.name) && isStationTrackCount(value.tracks) && isStopHost(value.host)
  );
}

function isWarehouseTrackCount(value: unknown): value is WarehouseTrackCount {
  return isOneOf(value, warehouseTrackCounts);
}

function isWarehouse(value: unknown): value is Warehouse {
  return (
    isRecord(value) &&
    isString(value.name) &&
    isWarehouseTrackCount(value.tracks) &&
    isStopHost(value.host) &&
    isArrayOf(value.goods, isGood)
  );
}

function isStopRef(value: unknown): value is StopRef {
  return (
    isRecord(value) &&
    (value.kind === 'station' || value.kind === 'warehouse') &&
    isString(value.name)
  );
}

function isTrainCargo(value: unknown): value is TrainCargo {
  return isOneOf(value, trainCargoTypes);
}

function isTrainLine(value: unknown): value is TrainLine {
  return (
    isRecord(value) &&
    isString(value.name) &&
    isArrayOf(value.stops, isStopRef) &&
    isNumber(value.trains) &&
    isOptionalNumber(value.tourDays) &&
    isTrainCargo(value.cargo)
  );
}

function isGameState(value: unknown): value is GameState {
  return (
    isRecord(value) &&
    isArrayOf(value.goods, isGood) &&
    isArrayOf(value.ruralBusinessTypes, isRuralBusinessType) &&
    isArrayOf(value.industryTypes, isIndustryType) &&
    isArrayOf(value.demands, isDemand) &&
    isArrayOf(value.cities, isCity) &&
    isArrayOf(value.ruralBusinesses, isRuralBusiness) &&
    isArrayOf(value.industries, isIndustry) &&
    isArrayOf(value.trainStations, isTrainStation) &&
    isArrayOf(value.warehouses, isWarehouse) &&
    isArrayOf(value.trainLines, isTrainLine)
  );
}

function isStoredGameState(value: unknown): value is StoredGameState {
  return isRecord(value) && value.version === STORAGE_VERSION && isGameState(value.state);
}

export function serializeGameState(state: GameState): string {
  const stored: StoredGameState = { version: STORAGE_VERSION, state };
  return JSON.stringify(stored);
}

export function deserializeGameState(json: string): GameState | undefined {
  try {
    const parsed: unknown = JSON.parse(json);
    return isStoredGameState(parsed) ? parsed.state : undefined;
  } catch {
    return undefined;
  }
}

export function loadGameStateFromStorage(): GameState | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === null ? undefined : deserializeGameState(raw);
  } catch {
    return undefined;
  }
}

export function saveGameStateToStorage(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, serializeGameState(state));
  } catch {
    // localStorage may be unavailable (e.g. private browsing quota); persistence is best-effort
  }
}

export function clearStoredGameState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // best-effort, see saveGameStateToStorage
  }
}
