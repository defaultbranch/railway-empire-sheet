import type { RuralBusiness } from './game-state/types';
import type { DefaultRuralBusinessTypeName } from './default-rural-business-types';

type DefaultRuralBusiness = Omit<RuralBusiness, 'typeName'> & { typeName: DefaultRuralBusinessTypeName };

export const defaultRuralBusinesses: readonly DefaultRuralBusiness[] = [
  { name: 'Allen Preserve', typeName: 'Sugar Plant', level: 1 },
  { name: 'Clark Preserve', typeName: 'Vegetable Farm', level: 3 },
  { name: 'Collins Farm', typeName: 'Wheat Farm', level: 2 },
  { name: 'Davis Quarry', typeName: 'Iron Mine', level: 1 },
  { name: 'Green Forest aisles', typeName: 'Logging Camp', level: 3 },
  { name: 'Harris Breeding', typeName: 'Cattle Farm', level: 4 },
  { name: 'Hill Farm', typeName: 'Cotton Farm', level: 4 },
  { name: 'Kelly Farm', typeName: 'Corn Farm', level: 1 },
  { name: 'Lee Cattle', typeName: 'Cattle Farm', level: 5 },
  { name: 'Martin Farm', typeName: 'Sugar Plant', level: 5 },
  { name: 'Moore Ranch', typeName: 'Milk Farm', level: 3 },
  { name: 'Reed Breading', typeName: 'Cattle Farm', level: 2 },
  { name: 'Roberts Manor', typeName: 'Corn Farm', level: 4 },
  { name: 'Robinson Manor', typeName: 'Sugar Plant', level: 3 },
  { name: 'Stark Farm', typeName: 'Fruit Orchard', level: 3 },
  { name: 'Stevens Estate', typeName: 'Wheat Farm', level: 4 },
  { name: 'Steward Preserve', typeName: 'Wheat Farm', level: 4 },
  { name: 'Walker Fattening', typeName: 'Cattle Farm', level: 5 },
  { name: 'Wilson Farm', typeName: 'Vegetable Farm', level: 2 },
  { name: 'Wright Farm', typeName: 'Cotton Farm', level: 3 },
  { name: 'Young Logging', typeName: 'Logging Camp', level: 2 },
] as const;

export type DefaultRuralBusinessName = (typeof defaultRuralBusinesses)[number]['name'];
