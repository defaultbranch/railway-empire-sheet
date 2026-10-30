import type { City, Demand, Good } from '../game-state/types';
import type { FlowSolution } from '../solver/solver-types';
import { demandForCity } from './population-demand';

export type MissingPopulationSupply = {
  kind: 'missing-population-supply';
  city: string;
  good: Good;
  minPopulation: number;
  priority: number;
  demand: number;
};

export function analyzePopulationSupply(
  cities: City[],
  demands: Demand[],
  solution: FlowSolution,
): MissingPopulationSupply[] {
  const thresholds = [...new Set(demands.filter((demand) => demand.wagonsPerMillion > 0)
    .map((demand) => demand.minPopulation))].sort((first, second) => first - second);
  const supplied = new Map<string, Map<Good, number>>();
  for (const flow of solution.contributorFlows) {
    if (flow.contributor.kind !== 'population') continue;
    const citySupply = supplied.get(flow.contributor.city) ?? new Map<Good, number>();
    citySupply.set(flow.good, (citySupply.get(flow.good) ?? 0) + flow.served);
    supplied.set(flow.contributor.city, citySupply);
  }

  return cities.flatMap((city) => demands.flatMap((demand): MissingPopulationSupply[] => {
    const requested = demandForCity(demand, city);
    if (requested <= 0 || (supplied.get(city.name)?.get(demand.good) ?? 0) > 0) return [];
    return [{
      kind: 'missing-population-supply',
      city: city.name,
      good: demand.good,
      minPopulation: demand.minPopulation,
      priority: thresholds.indexOf(demand.minPopulation) + 1,
      demand: requested,
    }];
  })).sort((first, second) => first.priority - second.priority
    || first.city.localeCompare(second.city) || first.good.localeCompare(second.good));
}
