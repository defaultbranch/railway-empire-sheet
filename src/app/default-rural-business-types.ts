import { emptyProductionByLevel, type RuralBusinessType } from './game-state/types';
import type { DefaultGood } from './default-goods';

type DefaultRuralBusinessType = Omit<RuralBusinessType, 'good'> & { good: DefaultGood };

export const defaultRuralBusinessTypes = [
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
] as const satisfies readonly DefaultRuralBusinessType[];

export type DefaultRuralBusinessTypeName = (typeof defaultRuralBusinessTypes)[number]['name'];

