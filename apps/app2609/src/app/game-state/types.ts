import * as GameDomain from '@railway/shared/game-domain';

export * from '@railway/shared/game-domain';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isArrayOf<T>(value: unknown, isItem: (item: unknown) => item is T): value is T[] {
  return Array.isArray(value) && value.every(isItem);
}

// combined shape used only by the initial-state loader; each dimension is otherwise stored independently
export type GameState = {
  goods: GameDomain.Good[];
  ruralBusinessTypes: GameDomain.RuralBusinessType[];
  industryTypes: GameDomain.IndustryType[];
  demands: GameDomain.Demand[];
  cities: GameDomain.City[];
  ruralBusinesses: GameDomain.RuralBusiness[];
  industries: GameDomain.Industry[];
  trainStations: GameDomain.TrainStation[];
  warehouses: GameDomain.Warehouse[];
  trainLines: GameDomain.TrainLine[];
};

export const GameState = {
  isInstance: (value: unknown): value is GameState =>
    isRecord(value) &&
    isArrayOf(value.goods, GameDomain.Good.isInstance) &&
    isArrayOf(value.ruralBusinessTypes, GameDomain.RuralBusinessType.isInstance) &&
    isArrayOf(value.industryTypes, GameDomain.IndustryType.isInstance) &&
    isArrayOf(value.demands, GameDomain.Demand.isInstance) &&
    isArrayOf(value.cities, GameDomain.City.isInstance) &&
    isArrayOf(value.ruralBusinesses, GameDomain.RuralBusiness.isInstance) &&
    isArrayOf(value.industries, GameDomain.Industry.isInstance) &&
    isArrayOf(value.trainStations, GameDomain.TrainStation.isInstance) &&
    isArrayOf(value.warehouses, GameDomain.Warehouse.isInstance) &&
    isArrayOf(value.trainLines, GameDomain.TrainLine.isInstance),
} as const;
