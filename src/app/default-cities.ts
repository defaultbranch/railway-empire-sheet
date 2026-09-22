import type { City } from './game-state/types';

export const defaultCities = [
  { name: 'Baker City', population: 52_837 },
  { name: 'Billings', population: 105_588 },
  { name: 'Casper', population: 66_709 },
  { name: 'Gardiner', population: 91_288 },
  { name: 'Great Falls', population: 34_846 },
  { name: 'Idaho Falls', population: 104_695 },
  { name: 'Miles City', population: 101_106 },
  { name: 'Missoula', population: 65_907 },
  { name: 'Nampa', population: 74_311 },
  { name: 'Rock Springs', population: 76_169 },
  { name: 'Spokane', population: 12_722 },
] as const satisfies readonly City[];

export type DefaultCityName = (typeof defaultCities)[number]['name'];
