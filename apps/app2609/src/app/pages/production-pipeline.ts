import type { Good, IndustryType, RuralBusinessType } from '../game-state/types';

export type PipelineStep = {
  name: string;
  multiplier: number;
  cost: number | undefined;
};

export type Pipeline = {
  totalCost: number | undefined;
  steps: PipelineStep[];
};

// relative setup cost and involved capacity for producing `requiredRate` units/week of `good`,
// walking industries back to the rural businesses that ultimately supply raw materials;
// undefined if no producer is known, or a producer's cost basis or level-1 rate is not yet surveyed
export function computePipeline(
  good: Good,
  requiredRate: number,
  ruralBusinessTypes: RuralBusinessType[],
  industryTypes: IndustryType[],
  visited: Set<Good> = new Set(),
): Pipeline | undefined {
  if (visited.has(good)) return undefined;
  const nextVisited = new Set(visited).add(good);

  const ruralBusiness = ruralBusinessTypes.find((type) => type.good === good);
  if (ruralBusiness !== undefined) {
    const level1Production = ruralBusiness.productionByLevel[1];
    if (level1Production === undefined) return undefined;
    const multiplier = requiredRate / level1Production;
    const cost = ruralBusiness.setupCostBasis === undefined ? undefined : multiplier * ruralBusiness.setupCostBasis;
    return { totalCost: cost, steps: [{ name: ruralBusiness.name, multiplier, cost }] };
  }

  const industry = industryTypes.find((type) => type.products.some((flow) => flow.good === good));
  if (industry !== undefined) {
    const productFlow = industry.products.find((flow) => flow.good === good)!;
    const level1Output = productFlow.amountByLevel[1];
    if (level1Output === undefined || industry.setupCostBasis === undefined) return undefined;
    const multiplier = requiredRate / level1Output;
    const cost = multiplier * industry.setupCostBasis;
    const steps: PipelineStep[] = [{ name: industry.name, multiplier, cost }];
    let totalCost: number | undefined = cost;

    for (const rawMaterial of industry.rawMaterials) {
      const rawLevel1 = rawMaterial.amountByLevel[1];
      if (rawMaterial.good === undefined || rawLevel1 === undefined) return undefined;
      const rawRequiredRate = requiredRate * (rawLevel1 / level1Output);
      const rawPipeline = computePipeline(
        rawMaterial.good,
        rawRequiredRate,
        ruralBusinessTypes,
        industryTypes,
        nextVisited,
      );
      if (rawPipeline === undefined) return undefined;
      if (totalCost !== undefined && rawPipeline.totalCost !== undefined) {
        totalCost += rawPipeline.totalCost;
      } else {
        totalCost = undefined;
      }
      steps.push(...rawPipeline.steps);
    }

    return { totalCost, steps };
  }

  return undefined;
}
