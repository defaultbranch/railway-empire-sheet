import type { Industry } from './game-state/types';
import type { DefaultIndustryTypeName } from './default-industry-types';
import type { DefaultCityName } from './default-cities';

type DefaultIndustry = Omit<Industry, 'typeName' | 'city'> & {
  typeName: DefaultIndustryTypeName;
  city: DefaultCityName;
};

export const defaultIndustries: readonly DefaultIndustry[] = [
  { city: 'Baker City', citySlot: 0, typeName: 'Weaving Factory', level: 2 },
  { city: 'Billings', citySlot: 0, typeName: 'Meat Industry', level: 4 },
  { city: 'Casper', citySlot: 0, typeName: 'Meat Industry', level: 2 },
  { city: 'Cheyenne', citySlot: 0, typeName: 'Meat Industry', level: 1 },
  { city: 'Denver', citySlot: 0, typeName: 'Distillery', level: 1 },
  { city: 'Elko', citySlot: 0, typeName: 'Meat Industry', level: 1 },
  { city: 'Flagstaff', citySlot: 0, typeName: 'Meat Industry', level: 1 },
  { city: 'Gardiner', citySlot: 0, typeName: 'Brewery', level: 3 },
  { city: 'Grand Junction', citySlot: 0, typeName: 'Meat Industry', level: 1 },
  { city: 'Great Falls', citySlot: 0, typeName: 'Meat Industry', level: 1 },
  { city: 'Idaho Falls', citySlot: 0, typeName: 'Meat Industry', level: 3 },
  { city: 'Kingman', citySlot: 0, typeName: 'Brewery', level: 1 },
  { city: 'Miles City', citySlot: 0, typeName: 'Brewery', level: 4 },
  { city: 'Milford', citySlot: 0, typeName: 'Brewery', level: 1 },
  { city: 'Missoula', citySlot: 0, typeName: 'Brewery', level: 2 },
  { city: 'Nampa', citySlot: 0, typeName: 'Meat Industry', level: 2 },
  { city: 'Raton', citySlot: 0, typeName: 'Brewery', level: 1 },
  { city: 'Rock Springs', citySlot: 0, typeName: 'Furniture Industry', level: 1 },
  { city: 'Salt Lake City', citySlot: 0, typeName: 'Brewery', level: 2 },
  { city: 'Spokane', citySlot: 0, typeName: 'Brewery', level: 1 },
  { city: 'Baker City', citySlot: 1, typeName: 'Furniture Industry', level: 1 },
  { city: 'Billings', citySlot: 1, typeName: 'Weaving Factory', level: 3 },
  { city: 'Casper', citySlot: 1, typeName: 'Toolmaker', level: 1 },
  { city: 'Cheyenne', citySlot: 1, typeName: 'Weaving Factory', level: 1 },
  { city: 'Gardiner', citySlot: 1, typeName: 'Weaving Factory', level: 1 },
  // { city: 'Great Falls', citySlot: 1 },
  { city: 'Idaho Falls', citySlot: 1, typeName: 'Taylor', level: 1 },
  { city: 'Miles City', citySlot: 1, typeName: 'Taylor', level: 3 },
  { city: 'Missoula', citySlot: 1, typeName: 'Distillery', level: 1 },
  { city: 'Nampa', citySlot: 1, typeName: 'Preserver', level: 1 },
  { city: 'Rock Springs', citySlot: 1, typeName: 'Taylor', level: 1 },
  { city: 'Salt Lake City', citySlot: 1, typeName: 'Steel Industry', level: 1 },
  // { city: 'Spokane', citySlot: 1 },
] as const;
