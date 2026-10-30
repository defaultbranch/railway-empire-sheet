import type { GameState } from './game-state/types';
import { loadGameStateFromStorage } from './game-state/persistence';
import { defaultGoods } from './default-goods';
import { defaultRuralBusinessTypes } from './default-rural-business-types';
import { defaultRuralBusinesses } from './default-rural-businesses';
import { defaultIndustryTypes } from './default-industry-types';
import { defaultIndustries } from './default-industries';
import { defaultDemands } from './default-demands';
import { defaultCities } from './default-cities';
import { defaultTrainStations } from './default-train-stations';
import { defaultWarehouses } from './default-warehouses';
import { defaultTrainLines } from './default-train-lines';

export function emptyGameState(): GameState {
  return {
    goods: [],
    ruralBusinessTypes: [],
    industryTypes: [],
    demands: [],
    cities: [],
    ruralBusinesses: [],
    industries: [],
    trainStations: [],
    warehouses: [],
    trainLines: [],
  };
}

export function defaultGameState(): GameState {
  return {
    goods: [...defaultGoods],
    ruralBusinessTypes: [...defaultRuralBusinessTypes],
    industryTypes: [...defaultIndustryTypes],
    demands: [...defaultDemands],
    cities: [...defaultCities],
    ruralBusinesses: [...defaultRuralBusinesses],
    industries: [...defaultIndustries],
    trainStations: [...defaultTrainStations],
    warehouses: [...defaultWarehouses],
    trainLines: [...defaultTrainLines],
  };
}

// swap this to 'empty' to change startup behavior when nothing is persisted yet
type InitialStateSource = 'empty' | 'default';
const initialStateSource: InitialStateSource = 'default';

export function getInitialGameState(): GameState {
  const stored = loadGameStateFromStorage();
  if (stored) return stored;

  switch (initialStateSource) {
    case 'empty':
      return emptyGameState();
    case 'default':
      return defaultGameState();
  }
}
