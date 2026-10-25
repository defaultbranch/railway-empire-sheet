import type { City, Demand } from '../game-state/types';
import type { FlowSolution } from '../solver/solver-types';

export type PopulationDemandSort = { key: 'city' | 'demand' | 'unmet'; descending: boolean };

export function cityPopulationDemandRows(
  demand: Demand,
  cities: City[],
  solution: FlowSolution,
  sort: PopulationDemandSort,
) {
  const servedByCity = new Map<string, number>();
  for (const flow of solution.contributorFlows) {
    if (flow.good !== demand.good || flow.contributor.kind !== 'population') continue;
    const city = flow.contributor.city;
    servedByCity.set(city, (servedByCity.get(city) ?? 0) + flow.served);
  }
  return cities.map((city) => {
    const amount = demandForCity(demand, city);
    return { city, amount, unmet: Math.max(0, amount - (servedByCity.get(city.name) ?? 0)) };
  }).filter(({ amount }) => amount > 0).sort((left, right) => {
    const direction = sort.descending ? -1 : 1;
    if (sort.key === 'city') return direction * left.city.name.localeCompare(right.city.name);
    const difference = sort.key === 'demand' ? left.amount - right.amount : left.unmet - right.unmet;
    return direction * difference || left.city.name.localeCompare(right.city.name);
  });
}

// wagons/week demanded by a single city for a good, 0 below the demand's population threshold
export function demandForCity(demand: Demand, city: City): number {
  if (city.population < demand.minPopulation) return 0;
  return (demand.wagonsPerMillion * city.population) / 1_000_000;
}

// wagons/week demanded across all cities for a good
export function totalDemand(demand: Demand, cities: City[]): number {
  return cities.reduce((sum, city) => sum + demandForCity(demand, city), 0);
}
