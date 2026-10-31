import { Good } from './primitives.ts';
import { isArrayOf, isNumber, isOneOf, isRecord, isString } from './validation.ts';

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
    (value.tourDays === undefined || isNumber(value.tourDays)) &&
    TrainCargo.isInstance(value.cargo),
} as const;
