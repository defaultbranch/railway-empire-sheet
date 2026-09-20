import { emptyProductionByLevel, type GameState } from './game-state/types';

function emptyGameState(): GameState {
  return { goods: [], ruralBusinessTypes: [], industryTypes: [], demands: [] };
}

function fakeGameState(): GameState {
  return {
    goods: [
      'Grain', 'Corn', 'Wood', 'Coal', 'Cattle', 'Iron', 'Steel', 'Meat', 'Beer', 'Cotton',
      'Cloth', 'Chemicals', 'Sugar', 'Milk', 'Vegetables', 'Fruit', 'Clothing', 'Furniture',
      'Liquor', 'Dairy Products',
    ],
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
        rawMaterials: [{ good: 'Cattle', amountByLevel: { ...emptyProductionByLevel(), 1: 3.6, 2: 7.2 } }],
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
      {
        name: 'Brewery',
        // levels 2, 4, 5 not yet observed
        rawMaterials: [{ good: 'Grain', amountByLevel: { ...emptyProductionByLevel(), 1: 0.8, 3: 3.2 } }],
        products: [{ good: 'Beer', amountByLevel: { ...emptyProductionByLevel(), 1: 1.6, 3: 6.4 } }],
      },
      {
        name: 'Weaving Factory',
        rawMaterials: [{ good: 'Cotton', amountByLevel: { ...emptyProductionByLevel(), 1: 1.6 } }],
        products: [{ good: 'Cloth', amountByLevel: { ...emptyProductionByLevel(), 1: 1.6 } }],
      },
      {
        name: 'Chemical Factory',
        rawMaterials: [{ good: 'Coal', amountByLevel: { ...emptyProductionByLevel(), 1: 0.4 } }],
        products: [{ good: 'Chemicals', amountByLevel: { ...emptyProductionByLevel(), 1: 0.8 } }],
      },
    ],
    demands: [
      // fitted from Gardiner (pop 91288) and Spokane (pop 12722) weekly consumption samples
      { good: 'Grain', minPopulation: 0, wagonsPerMillion: 17.5 },
      { good: 'Corn', minPopulation: 0, wagonsPerMillion: 17.5 },
      { good: 'Wood', minPopulation: 0, wagonsPerMillion: 17.5 },
      { good: 'Beer', minPopulation: 0, wagonsPerMillion: 17.5 },
      { good: 'Meat', minPopulation: 0, wagonsPerMillion: 26 },
      { good: 'Sugar', minPopulation: 30000, wagonsPerMillion: 10 },
      { good: 'Cloth', minPopulation: 35000, wagonsPerMillion: 10 },
      { good: 'Milk', minPopulation: 40000, wagonsPerMillion: 10 },
      { good: 'Vegetables', minPopulation: 45000, wagonsPerMillion: 10 },
      { good: 'Fruit', minPopulation: 50000, wagonsPerMillion: 10 },
      { good: 'Clothing', minPopulation: 55000, wagonsPerMillion: 10 },
      // thresholds below are extrapolated from the 30k/35k/.../55k progression, not directly observed
      { good: 'Furniture', minPopulation: 60000, wagonsPerMillion: 10 },
      { good: 'Liquor', minPopulation: 65000, wagonsPerMillion: 10 },
      { good: 'Dairy Products', minPopulation: 70000, wagonsPerMillion: 10 },
      // Coal, Cattle and Cotton show no population demand in the samples (industry-only, or threshold not yet reached)
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
