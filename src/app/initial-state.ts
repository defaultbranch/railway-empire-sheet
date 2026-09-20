import { emptyProductionByLevel, type GameState } from './game-state/types';

function emptyGameState(): GameState {
  return { goods: [], ruralBusinessTypes: [], industryTypes: [], demands: [] };
}

function fakeGameState(): GameState {
  return {
    goods: [
      'Grain', 'Cattle', 'Corn', 'Wood', 'Meat', 'Beer', 'Cotton', 'Sugar', 'Cloth', 'Milk',
      'Vegetables', 'Fruit', 'Clothing', 'Furniture', 'Liquor', 'Dairy Products', 'Coal', 'Iron',
      'Steel', 'Cement', 'Chemicals', 'Tools', 'Canned Foods', 'Oil', 'Petroleum',
    ],
    ruralBusinessTypes: [
      {
        name: 'Wheat Farm',
        good: 'Grain',
        // setup cost: 300k per 2.4 weekly production
        productionByLevel: { ...emptyProductionByLevel(), 1: 2.4, 2: 4.8, 3: 9.6, 4: 16.8, 5: 24.0 },
      },
      {
        name: 'Cattle Farm',
        good: 'Cattle',
        // setup cost: 300k per 2.4 weekly production
        productionByLevel: { ...emptyProductionByLevel(), 1: 2.4, 2: 4.8, 3: 9.6, 4: 16.8, 5: 24.0 },
      },
      {
        name: 'Corn Farm',
        good: 'Corn',
        // setup cost: 400k per 1.6 weekly production
        productionByLevel: { ...emptyProductionByLevel(), 1: 1.6, 2: 3.2, 3: 6.4, 4: 11.1, 5: 16.0 },
      },
      {
        name: 'Logging Camp',
        good: 'Wood',
        // setup cost: 100k per 3.2 weekly production
        productionByLevel: { ...emptyProductionByLevel(), 1: 3.2, 2: 6.4, 3: 12.8, 4:22.3, 5: 32.0 },
      },
      {
        name: 'Cotton Farm',
        good: 'Cotton',
        // setup cost: 400k per 1.6 weekly production
        productionByLevel: { ...emptyProductionByLevel(), 1: 1.6, 2: 3.2, 3: 6.4, 4: 11.1, 5: 16.0 },
      },
      {
        name: 'Sugar Plant',
        good: 'Sugar',
        // setup cost: 400k per 1.2 weekly production
        productionByLevel: { ...emptyProductionByLevel(), 1: 1.2, 2: 2.4, 3: 4.8, 4: 8.4, 5: 12.0 },
      },
      {
        name: 'Coal Mine',
        good: 'Coal',
        // setup cost: 500k per 1.0 weekly production
        productionByLevel: { ...emptyProductionByLevel(), 1: 1.0, 2: 2.0, 3: 4.0, 4: 7.0, 5: 10.0 },
      },
    ],
    industryTypes: [
      {
        name: 'Meat Industry',
        rawMaterials: [{ good: 'Cattle', amountByLevel: { ...emptyProductionByLevel(), 1: 3.6, 2: 7.2, 3: 14.4, 4: 25.2 } }],
        products:     [{ good: 'Meat',   amountByLevel: { ...emptyProductionByLevel(), 1: 2.4, 2: 4.8, 3: 9.6, 4: 16.8 } }],
      },
      {
        name: 'Brewery',
        rawMaterials: [{ good: 'Grain', amountByLevel: { ...emptyProductionByLevel(), 1: 0.8, 2: 1.6, 3: 3.2, 4:  5.5 } }],
        products:     [{ good: 'Beer',  amountByLevel: { ...emptyProductionByLevel(), 1: 1.6, 2: 3.2, 3: 6.4, 4: 11.1 } }],
      },
      {
        name: 'Weaving Factory',
        rawMaterials: [{ good: 'Cotton', amountByLevel: { ...emptyProductionByLevel(), 1: 1.6, 2: 3.2, 3: 6.4 } }],
        products:     [{ good: 'Cloth',  amountByLevel: { ...emptyProductionByLevel(), 1: 1.6, 2: 3.2, 3: 6.4 } }],
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
