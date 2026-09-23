import type { City, Demand, Good, Industry, IndustryType, RuralBusiness, RuralBusinessType } from '../game-state/types';
import { totalDemand } from './population-demand';

// weekly production of every good directly from placed rural businesses, at their current level
function rawSupply(ruralBusinesses: RuralBusiness[], ruralBusinessTypes: RuralBusinessType[]): Map<Good, number> {
  const supply = new Map<Good, number>();
  for (const business of ruralBusinesses) {
    const type = ruralBusinessTypes.find((existing) => existing.name === business.typeName);
    const amount = type?.productionByLevel[business.level];
    if (type === undefined || amount === undefined) continue;
    supply.set(type.good, (supply.get(type.good) ?? 0) + amount);
  }
  return supply;
}

// weekly output `industry` can actually reach producing `good`, capped by both its recipe capacity
// at its level and by what's left of each raw material in `pool`; consumes that amount from `pool`
function produce(industry: Industry, type: IndustryType, good: Good, pool: Map<Good, number>): number {
  const capacity = type.products.find((flow) => flow.good === good)?.amountByLevel[industry.level];
  if (capacity === undefined) return 0;

  let multiplier = 1;
  for (const rawMaterial of type.rawMaterials) {
    const needed = rawMaterial.good === undefined ? undefined : rawMaterial.amountByLevel[industry.level];
    if (rawMaterial.good === undefined || needed === undefined || needed === 0) continue;
    multiplier = Math.min(multiplier, (pool.get(rawMaterial.good) ?? 0) / needed);
  }
  multiplier = Math.max(0, Math.min(1, multiplier));

  for (const rawMaterial of type.rawMaterials) {
    const needed = rawMaterial.good === undefined ? undefined : rawMaterial.amountByLevel[industry.level];
    if (rawMaterial.good === undefined || needed === undefined) continue;
    pool.set(rawMaterial.good, (pool.get(rawMaterial.good) ?? 0) - needed * multiplier);
  }

  return capacity * multiplier;
}

// idealized weekly supply of every good: rural production, plus whatever industries can manufacture
// from raw materials left over once each good's own population demand is met. Goods are settled in
// `goods` order, so a good earlier in that order both feeds and consumes before a later one does;
// this does not model the game's actual logistics, only an upper bound assuming perfect distribution
export function totalSupply(
  goods: Good[],
  ruralBusinesses: RuralBusiness[],
  ruralBusinessTypes: RuralBusinessType[],
  industries: Industry[],
  industryTypes: IndustryType[],
  demands: Demand[],
  cities: City[],
): Map<Good, number> {
  const pool = rawSupply(ruralBusinesses, ruralBusinessTypes);
  const supply = new Map<Good, number>();

  for (const good of goods) {
    let produced = 0;
    for (const industry of industries) {
      const type = industryTypes.find((existing) => existing.name === industry.typeName);
      if (type === undefined || !type.products.some((flow) => flow.good === good)) continue;
      produced += produce(industry, type, good, pool);
    }
    pool.set(good, (pool.get(good) ?? 0) + produced);
    supply.set(good, pool.get(good) ?? 0);

    const demand = demands.find((existing) => existing.good === good);
    const populationDemand = demand === undefined ? 0 : totalDemand(demand, cities);
    pool.set(good, Math.max(0, (pool.get(good) ?? 0) - populationDemand));
  }

  return supply;
}
