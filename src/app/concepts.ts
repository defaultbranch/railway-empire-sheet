import { DirectLinesComponent } from "./game-state/direct-lines/direct-lines.component";



/**
 * Goods are just unique strings, but not enums.
 *
 * Different games have different goods, and sometimes different production chains for the same goods.
 */
export type Good = string;

export type RuralType = {
  name: Good,
  productos?: {
    name: Good,
    perWeek?: number[],
  }[];
}

export type RuralBusiness = {
  name: string;
  product: Good;
  size: number;
}

export type IndustryType = {
  name: IndustryName,
  materiasPrimas?: {
    name: Good,
    perWeek?: number[],
  }[],
  productos?: {
    name: Good,
    perWeek?: number[],
  }[];
};

export type IndustryName = string;

export type Ciudad = {
  name: string,
  population: number,
  businesses: [CityBusiness?, CityBusiness?, CityBusiness?],
}

export type CityName = string;

export type CityBusiness = {
  name: IndustryName,
  size: number,
}

export type DirectLine = {

  type: 'DirectLine',
  id: string,

  ruralProducer: string,
  destinationCity: CityName,
  miles: number,
  cost: number,
}

export function isDirectline(x: unknown): x is DirectLine {
  const cand = x as DirectLine;
  const val = cand.type === 'DirectLine' && cand.id !== undefined && cand.ruralProducer !== undefined && cand.destinationCity !== undefined && cand.miles !== undefined && cand.cost !== undefined;
  return val;
}

export function requireDirectline(x: unknown): x is DirectLine {
  const val = isDirectline(x);
  if (!val) throw new Error('DirectLine required');
  return val;
}

export type ProviderConnection = {

  type: 'ProviderConnection',
  id: string,

  ruralProducer: string,
  destinationCity: CityName,
  good: Good,
  productionFactor?: number,
  demandFactor?: number,
  lastRun?: Date,
}

export function isProviderConnection(x: unknown): x is ProviderConnection {
  const cand = x as ProviderConnection;
  const val = cand.type === 'ProviderConnection' && cand.id !== undefined && cand.ruralProducer !== undefined && cand.destinationCity !== undefined && cand.good !== undefined;
  return val;
}

export function requireProviderConnection(x: unknown): x is ProviderConnection {
  const val = isProviderConnection(x);
  if (!val) throw new Error('ProviderConnection required');
  return val;
}

export type Line
  = DirectLine
  | ProviderConnection
  ;

export function isLine(x: unknown): x is Line {
  const val = isDirectline(x) || isProviderConnection(x);
  return val;
}

export function requireLine(x: unknown): x is Line {
  const val = isLine(x);
  if (!val) throw new Error('ProviderConnection required');
  return val;
}
