


/**
 * Goods are just unique strings, but not enums.
 *
 * Different games have different goods, and sometimes different production chains for the same goods.
 */
export type Good = string;


export type Negocio = {
  name: Good;
  productos?: {
    name: Good;
    perWeek?: number[];
  }[];
}
