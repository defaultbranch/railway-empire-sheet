


/**
 * Goods are just unique strings, but not enums.
 *
 * Different games have different goods, and sometimes different production chains for the same goods.
 */
export type Good = string;

export type Negocio = {
  name: Good,
  productos?: {
    name: Good,
    perWeek?: number[],
  }[];
}

export type Industria = {
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

export type Business = {
  name: IndustryName,
  size: number,
}
