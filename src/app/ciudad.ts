export type Ciudad = {
  name: string;
  size: number;
  population: number;
  businesses?: {
    business: string;
    size: number
  }[];
  perWeek?: { [product: string]: number };
}
