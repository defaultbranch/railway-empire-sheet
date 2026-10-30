import type { City } from './game-state/types';

export const defaultCities = [
  { name: 'Baker City', population: 52_837 },
  { name: 'Billings', population: 105_588 },
  { name: 'Casper', population: 66_709 },
  { name: 'Cheyenne', population: 64_397 },
  { name: 'Denver', population: 12_512 },
  { name: 'Elko', population: 36_820 },
  { name: 'Flagstaff', population: 11_593 },
  { name: 'Gardiner', population: 91_288 },
  { name: 'Grand Junction', population: 15_593 },
  { name: 'Great Falls', population: 34_846 },
  { name: 'Idaho Falls', population: 104_695 },
  { name: 'Kingman', population: 15_931 },
  { name: 'Miles City', population: 101_106 },
  { name: 'Milford', population: 22_587 },
  { name: 'Missoula', population: 65_907 },
  { name: 'Nampa', population: 74_311 },
  { name: 'Raton', population: 12_109 },
  { name: 'Rock Springs', population: 76_169 },
  { name: 'Salt Lake City', population: 60_622 },
  { name: 'Spokane', population: 12_722 },
] as const satisfies readonly City[];

export type DefaultCityName = (typeof defaultCities)[number]['name'];
