export type Industria = {
  name: string;
  materiasPrimas?: {
    name: string;
    perWeek?: number[];
  }[];
  productos?: {
    name: string;
    perWeek?: number[];
  }[];
};
