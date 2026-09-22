import type { GameState } from './game-state/types';
import { defaultGoods } from './default-goods';
import { defaultRuralBusinessTypes } from './default-rural-business-types';
import { defaultRuralBusinesses } from './default-rural-businesses';
import { defaultIndustryTypes } from './default-industry-types';
import { defaultIndustries } from './default-industries';
import { defaultDemands } from './default-demands';
import { defaultCities } from './default-cities';

function emptyGameState(): GameState {
  return {
    goods: [],
    ruralBusinessTypes: [],
    industryTypes: [],
    demands: [],
    cities: [],
    ruralBusinesses: [],
    industries: [],
  };
}

function fakeGameState(): GameState {
  return {
    goods: [...defaultGoods],
    ruralBusinessTypes: [...defaultRuralBusinessTypes],
    industryTypes: [...defaultIndustryTypes],
    demands: [...defaultDemands],
    cities: [...defaultCities],
    ruralBusinesses: [...defaultRuralBusinesses],
    industries: [...defaultIndustries],
  };
}


// swap this to 'empty' or a future 'saved' source to change dev/startup behavior
type InitialStateSource = 'empty' | 'fake';
const initialStateSource: InitialStateSource = 'fake';

export function getInitialGameState(): GameState {
  switch (initialStateSource) {
    case 'empty':
      return emptyGameState();
    case 'fake':
      return fakeGameState();
  }
}
