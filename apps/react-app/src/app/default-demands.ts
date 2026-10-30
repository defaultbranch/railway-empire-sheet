import type { Demand } from './game-state/types';
import type { DefaultGood } from './default-goods';

type DefaultDemand = Omit<Demand, 'good'> & { good: DefaultGood };

export const defaultDemands: readonly DefaultDemand[] = [
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
];
