import { emptyProductionByLevel, type GameState } from './game-state';

function emptyGameState(): GameState {
  return { goods: [], ruralBusinessTypes: [] };
}

function fakeGameState(): GameState {
  return {
    goods: ['Grain', 'Wood', 'Coal', 'Livestock'],
    ruralBusinessTypes: [
      {
        name: 'Wheat Farm',
        good: 'Grain',
        productionByLevel: { ...emptyProductionByLevel(), 1: 10, 2: 18, 3: 26 },
      },
      {
        name: 'Logging Camp',
        good: 'Wood',
        productionByLevel: { ...emptyProductionByLevel(), 1: 8, 2: 14 },
      },
      {
        name: 'Coal Mine',
        good: 'Coal',
        productionByLevel: { ...emptyProductionByLevel(), 1: 6 },
      },
    ],
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
