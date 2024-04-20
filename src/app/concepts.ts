


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

export type NegocioRural = {
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
  businesses: [Business?, Business?, Business?],
}

export type CityName = string;

export type Business = {
  name: IndustryName,
  size: number,
}

export type DirectLine = {
  ruralProducer: string,
  destinationCity: CityName,
  miles: number,
  cost: number,
}

export type ProviderConnection = {
  ruralProducer: string,
  destinationCity: CityName,
  good: Good,
  productionFactor?: number,
  demandFactor?: number,
  lastRun?: Date,
}
