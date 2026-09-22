import { emptyProductionByLevel, type GoodFlow, type IndustryType } from './game-state/types';
import type { DefaultGood } from './default-goods';

type DefaultGoodFlow = Omit<GoodFlow, 'good'> & { good: DefaultGood };
type DefaultIndustryType = Omit<IndustryType, 'rawMaterials' | 'products'> & {
  rawMaterials: DefaultGoodFlow[];
  products: DefaultGoodFlow[];
};

export const defaultIndustryTypes: readonly DefaultIndustryType[] = [
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
] as const;
