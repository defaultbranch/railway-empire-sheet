import { emptyProductionByLevel, type GameState } from './game-state/types';

function emptyGameState(): GameState {
  return { goods: [], ruralBusinessTypes: [], industryTypes: [], demands: [] };
}

function fakeGameState(): GameState {
  return {
    goods: ['Grain', 'Wood', 'Coal', 'Livestock', 'Iron', 'Steel', 'Meat', 'Furniture'],
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
    industryTypes: [
      {
        name: 'Meat Packing Plant',
        rawMaterials: [{ good: 'Livestock', amountByLevel: { ...emptyProductionByLevel(), 1: 3.6, 2: 7.2 } }],
        products: [{ good: 'Meat', amountByLevel: { ...emptyProductionByLevel(), 1: 2.4, 2: 4.8 } }],
      },
      {
        name: 'Steel Mill',
        rawMaterials: [
          { good: 'Coal', amountByLevel: { ...emptyProductionByLevel(), 1: 0.4 } },
          { good: 'Iron', amountByLevel: { ...emptyProductionByLevel(), 1: 0.8 } },
        ],
        products: [{ good: 'Steel', amountByLevel: { ...emptyProductionByLevel(), 1: 0.8 } }],
      },
      {
        name: 'Furniture Factory',
        rawMaterials: [{ good: 'Wood', amountByLevel: { ...emptyProductionByLevel(), 1: 0.8 } }],
        products: [{ good: 'Furniture', amountByLevel: { ...emptyProductionByLevel(), 1: 1.6 } }],
      },
    ],
    demands: [
      { good: 'Grain', minPopulation: 0, wagonsPerMillion: 40 },
      { good: 'Wood', minPopulation: 0, wagonsPerMillion: 25 },
      { good: 'Coal', minPopulation: 500, wagonsPerMillion: 20 },
      { good: 'Meat', minPopulation: 1000, wagonsPerMillion: 15 },
      { good: 'Furniture', minPopulation: 3000, wagonsPerMillion: 8 },
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
