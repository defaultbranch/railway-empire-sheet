import type { City, Demand } from '../game-state/types';

// wagons/week demanded by a single city for a good, 0 below the demand's population threshold
export function demandForCity(demand: Demand, city: City): number {
  if (city.population < demand.minPopulation) return 0;
  return (demand.wagonsPerMillion * city.population) / 1_000_000;
}

// wagons/week demanded across all cities for a good
export function totalDemand(demand: Demand, cities: City[]): number {
  return cities.reduce((sum, city) => sum + demandForCity(demand, city), 0);
}
