import type { City, Demand, Good, IndustryType } from '../game-state/types';
import { demandForCity, totalDemand } from './population-demand';

// adds `requiredRate` wagons/week of `good` to `totals`, then attributes the raw materials an
// industry needs to produce that rate as further induced demand on those input goods
function addRequiredRate(
  good: Good,
  requiredRate: number,
  industryTypes: IndustryType[],
  totals: Map<Good, number>,
  visited: Set<Good>,
): void {
  totals.set(good, (totals.get(good) ?? 0) + requiredRate);
  if (visited.has(good)) return; // avoid infinite recursion on cyclic recipes
  const nextVisited = new Set(visited).add(good);

  const industry = industryTypes.find((type) => type.products.some((flow) => flow.good === good));
  if (industry === undefined) return; // not manufactured, so no further upstream demand

  const productFlow = industry.products.find((flow) => flow.good === good)!;
  const level1Output = productFlow.amountByLevel[1];
  if (level1Output === undefined || level1Output === 0) return;

  for (const rawMaterial of industry.rawMaterials) {
    const rawLevel1 = rawMaterial.amountByLevel[1];
    if (rawMaterial.good === undefined || rawLevel1 === undefined) continue;
    const rawRequiredRate = requiredRate * (rawLevel1 / level1Output);
    addRequiredRate(rawMaterial.good, rawRequiredRate, industryTypes, totals, nextVisited);
  }
}

// total wagons/week demand for every good in a single city: its own population demand plus,
// for manufactured goods, the induced demand industries place on their raw materials
export function totalDemandForCity(demands: Demand[], city: City, industryTypes: IndustryType[]): Map<Good, number> {
  const totals = new Map<Good, number>();
  for (const demand of demands) {
    addRequiredRate(demand.good, demandForCity(demand, city), industryTypes, totals, new Set());
  }
  return totals;
}

// same as totalDemandForCity, but summed across all cities
export function totalDemandAcrossCities(
  demands: Demand[],
  cities: City[],
  industryTypes: IndustryType[],
): Map<Good, number> {
  const totals = new Map<Good, number>();
  for (const demand of demands) {
    addRequiredRate(demand.good, totalDemand(demand, cities), industryTypes, totals, new Set());
  }
  return totals;
}
