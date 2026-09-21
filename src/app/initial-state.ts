import { emptyProductionByLevel, type GameState } from './game-state/types';

function emptyGameState(): GameState {
  return { goods: [], ruralBusinessTypes: [], industryTypes: [], demands: [] };
}

function fakeGameState(): GameState {
  return {
    goods: [
      'Grain', 'Cattle', 'Corn', 'Wood', 'Meat', 'Beer', 'Cotton', 'Sugar', 'Cloth', 'Milk',
      'Vegetables', 'Fruits', 'Clothing', 'Furniture', 'Liquor', 'Dairy Products', 'Coal', 'Iron',
      'Steel', 'Cement', 'Chemicals', 'Tools', 'Canned Foods', 'Oil', 'Petroleum',
    ],
    ruralBusinessTypes: [
      {
        name: 'Wheat Farm',
        good: 'Grain',
        productionByLevel: { ...emptyProductionByLevel(), 1: 2.4, 2: 4.8, 3: 9.6, 4: 16.8, 5: 24.0 },
        setupCostBasis: 300_000,
      },
      {
        name: 'Cattle Farm',
        good: 'Cattle',
        productionByLevel: { ...emptyProductionByLevel(), 1: 2.4, 2: 4.8, 3: 9.6, 4: 16.8, 5: 24.0 },
        setupCostBasis: 300_000,
      },
      {
        name: 'Corn Farm',
        good: 'Corn',
        productionByLevel: { ...emptyProductionByLevel(), 1: 1.6, 2: 3.2, 3: 6.4, 4: 11.1, 5: 16.0 },
        setupCostBasis: 400_000,
      },
      {
        name: 'Logging Camp',
        good: 'Wood',
        productionByLevel: { ...emptyProductionByLevel(), 1: 3.2, 2: 6.4, 3: 12.8, 4:22.3, 5: 32.0 },
        setupCostBasis: 100_000,
      },
      {
        name: 'Cotton Farm',
        good: 'Cotton',
        productionByLevel: { ...emptyProductionByLevel(), 1: 1.6, 2: 3.2, 3: 6.4, 4: 11.1, 5: 16.0 },
        setupCostBasis: 400_000,
      },
      {
        name: 'Sugar Plant',
        good: 'Sugar',
        productionByLevel: { ...emptyProductionByLevel(), 1: 1.2, 2: 2.4, 3: 4.8, 4: 8.4, 5: 12.0 },
        setupCostBasis: 400_000,
      },
      {
        name: 'Milk Farm',
        good: 'Milk',
        productionByLevel: { ...emptyProductionByLevel(), 1: 1.6, 2: 3.2, 3: 6.4 },
        setupCostBasis: 400_000,
      },
      {
        name: 'Vegetable Farm',
        good: 'Vegetables',
        productionByLevel: { ...emptyProductionByLevel(), 1: 0.8, 2: 1.6 },
        setupCostBasis: 500_000,
      },
      {
        name: 'Fruit Orchard',
        good: 'Fruits',
        productionByLevel: { ...emptyProductionByLevel(), 1: 1.2, 2: 2.4 },
        setupCostBasis: 400_000,
      },
      {
        name: 'Coal Mine',
        good: 'Coal',
        productionByLevel: { ...emptyProductionByLevel(), 1: 1.0, 2: 2.0, 3: 4.0, 4: 7.0, 5: 10.0 },
        setupCostBasis: 500_000,
      },
      {
        name: 'Iron Mine',
        good: 'Iron',
        productionByLevel: { ...emptyProductionByLevel(), 1: 1.2, 2:2.4 },
        setupCostBasis: 500_000,
      },
      {
        name: 'Drilling Rig',
        good: 'Oil',
        productionByLevel: { ...emptyProductionByLevel(), 1: 0.8, 2: 1.6 },
        setupCostBasis: 500_000,
      },
    ],
    industryTypes: [
      {
        name: 'Meat Industry',
        rawMaterials: [{ good: 'Cattle', amountByLevel: { ...emptyProductionByLevel(), 1: 3.6, 2: 7.2, 3: 14.4, 4: 25.2 } }],
        products:     [{ good: 'Meat',   amountByLevel: { ...emptyProductionByLevel(), 1: 2.4, 2: 4.8, 3: 9.6, 4: 16.8 } }],
        setupCostBasis: 300_000,
      },
      {
        name: 'Brewery',
        rawMaterials: [{ good: 'Grain', amountByLevel: { ...emptyProductionByLevel(), 1: 0.8, 2: 1.6, 3: 3.2, 4:  5.5 } }],
        products:     [{ good: 'Beer',  amountByLevel: { ...emptyProductionByLevel(), 1: 1.6, 2: 3.2, 3: 6.4, 4: 11.1 } }],
        setupCostBasis: 400_000,
      },
      {
        name: 'Weaving Factory',
        rawMaterials: [{ good: 'Cotton', amountByLevel: { ...emptyProductionByLevel(), 1: 1.6, 2: 3.2, 3: 6.4 } }],
        products:     [{ good: 'Cloth',  amountByLevel: { ...emptyProductionByLevel(), 1: 1.6, 2: 3.2, 3: 6.4 } }],
        setupCostBasis: 400_000,
      },
      {
        name: 'Taylor',
        rawMaterials: [{ good: 'Cloth',     amountByLevel: { ...emptyProductionByLevel(), 1: 0.8 } }],
        products:     [{ good: 'Clothing',  amountByLevel: { ...emptyProductionByLevel(), 1: 0.8 } }],
        setupCostBasis: 500_000,
      },
      {
        name: 'Distillery',
        rawMaterials: [
          { good: 'Fruits', amountByLevel: { ...emptyProductionByLevel(), 1: 0.4, 2: 0.8 } },
          { good: 'Sugar',  amountByLevel: { ...emptyProductionByLevel(), 1: 0.4, 2: 0.8 } },
        ],
        products: [{ good: 'Liquor',  amountByLevel: { ...emptyProductionByLevel(), 1: 0.8, 2: 1.6 } }],
        setupCostBasis: 500_000,
      },
      {
        name: 'Dairy Farm',
        rawMaterials: [{ good: 'Milk',           amountByLevel: { ...emptyProductionByLevel(), 1: 0.8, 2: 1.6 } }],
        products:     [{ good: 'Dairy Products', amountByLevel: { ...emptyProductionByLevel(), 1: 0.8, 2: 1.6 } }],
        setupCostBasis: 500_000,
      },
      {
        name: 'Steel Industry',
        rawMaterials: [
          { good: 'Coal',     amountByLevel: { ...emptyProductionByLevel(), 1: 0.6, 2: 1.2, 3: 2.4, 4: 4.2 } },
          { good: 'Iron',     amountByLevel: { ...emptyProductionByLevel(), 1: 1.2, 2: 2.4, 3: 4.8, 4: 8.4 } },
        ],
        products:     [{ good: 'Steel',  amountByLevel: { ...emptyProductionByLevel(), 1: 1.2, 2: 2.4, 3: 4.8, 4: 8.4 } }],
        setupCostBasis: 400_000,
      },
      {
        name: 'Furniture Industry',
        rawMaterials: [{ good: 'Wood',      amountByLevel: { ...emptyProductionByLevel(), 1: 0.8 } }],
        products:     [{ good: 'Furniture', amountByLevel: { ...emptyProductionByLevel(), 1: 1.6 } }],
        setupCostBasis: 500_000,
      },
      {
        name: 'Chemical Factory',
        rawMaterials: [{ good: 'Coal',      amountByLevel: { ...emptyProductionByLevel(), 1: 0.4 } }],
        products:     [{ good: 'Chemicals', amountByLevel: { ...emptyProductionByLevel(), 1: 0.8 } }],
        setupCostBasis: 500_000,
      },
      {
        name: 'Toolmaker',
        rawMaterials: [
          { good: 'Steel',     amountByLevel: { ...emptyProductionByLevel(), 1: 0.8 } },
          { good: 'Wood',     amountByLevel: { ...emptyProductionByLevel(), 1: 0.8 } },
        ],
        products:     [{ good: 'Tools', amountByLevel: { ...emptyProductionByLevel(), 1: 1.6 } }],
        setupCostBasis: 500_000,
      },
      {
        name: 'Preserver',
        rawMaterials: [
          { good: 'Vegetables', amountByLevel: { ...emptyProductionByLevel(), 1: 0.8 } },
          { good: 'Steel',      amountByLevel: { ...emptyProductionByLevel(), 1: 0.4 } },
        ],
        products: [{ good: 'Canned Foods', amountByLevel: { ...emptyProductionByLevel(), 1: 0.8 } }],
        setupCostBasis: 500_000,
      },
      {
        name: 'Refinery',
        // setup cost basis: unknown
        rawMaterials: [{ good: 'Oil',       amountByLevel: { ...emptyProductionByLevel() } }],
        products:     [{ good: 'Petroleum', amountByLevel: { ...emptyProductionByLevel() } }],
      },
    ],
    demands: [
      // fitted from Gardiner (pop 91288) and Spokane (pop 12722) weekly consumption samples
      { good: 'Grain', minPopulation: 0, wagonsPerMillion: 17.5 },
      { good: 'Corn', minPopulation: 0, wagonsPerMillion: 17.5 },
      { good: 'Wood', minPopulation: 0, wagonsPerMillion: 17.5 },
      { good: 'Beer', minPopulation: 0, wagonsPerMillion: 17.5 },
      { good: 'Meat', minPopulation: 0, wagonsPerMillion: 26 },
      // Cattle and Cotton have no population demand (industry-only)
      { good: 'Sugar', minPopulation: 30000, wagonsPerMillion: 10 },
      { good: 'Cloth', minPopulation: 35000, wagonsPerMillion: 10 },
      { good: 'Milk', minPopulation: 40000, wagonsPerMillion: 10 },
      { good: 'Vegetables', minPopulation: 45000, wagonsPerMillion: 10 },
      { good: 'Fruits', minPopulation: 50000, wagonsPerMillion: 10 },
      { good: 'Clothing', minPopulation: 55000, wagonsPerMillion: 10 },
      { good: 'Furniture', minPopulation: 60000, wagonsPerMillion: 10 },
      { good: 'Liquor', minPopulation: 65000, wagonsPerMillion: 10 },
      { good: 'Dairy Products', minPopulation: 70000, wagonsPerMillion: 10 },
      // fitted from Billings (pop 105588) weekly consumption sample
      { good: 'Cement', minPopulation: 90000, wagonsPerMillion: 9.5 },
      { good: 'Chemicals', minPopulation: 95000, wagonsPerMillion: 9.5 },
      { good: 'Tools', minPopulation: 100000, wagonsPerMillion: 19.9 },
      { good: 'Canned Foods', minPopulation: 105000, wagonsPerMillion: 9.5 },
      // Oil, Steel, Iron and Coal have no population demand (industry-only)
      // Petroleum demand is still unknown, minPopulation is 115k citizens
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
