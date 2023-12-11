export type Negocio = {
  name: string;
  productos?: {
    name: string;
    perWeek?: number[];
  }[];
}
