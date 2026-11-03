import type { Industry, IndustryType } from '../game-state/types';

export type DemandSample = {
  id: string;
  city: string;
  population: number;
  observations: { good: string; total: number; industry: number }[];
};

export function industryDemandForGood(
  city: string, good: string, industries: Industry[], industryTypes: IndustryType[],
): number | undefined {
  let total = 0;
  for (const industry of industries.filter((entry) => entry.city === city)) {
    const type = industryTypes.find((entry) => entry.name === industry.typeName);
    if (type === undefined) return undefined;
    for (const flow of type.rawMaterials) {
      if (flow.good === undefined) return undefined;
      if (flow.good !== good) continue;
      const amount = flow.amountByLevel[industry.level];
      if (amount === undefined || !Number.isFinite(amount) || amount < 0) return undefined;
      total += amount;
    }
  }
  return total;
}

export function estimateDemand(samples: DemandSample[], good: string, minPopulation = 0) {
  let numerator = 0;
  let denominator = 0;
  let count = 0;
  for (const sample of samples) {
    if (sample.population <= 0 || sample.population < minPopulation) continue;
    const observation = sample.observations.find((entry) => entry.good === good);
    if (observation === undefined) continue;
    const populationInMillions = sample.population / 1_000_000;
    numerator += populationInMillions * (observation.total - observation.industry);
    denominator += populationInMillions ** 2;
    count += 1;
  }
  return { count, wagonsPerMillion: denominator === 0 ? 0 : numerator / denominator };
}

export function isDemandSample(value: unknown): value is DemandSample {
  if (typeof value !== 'object' || value === null) return false;
  const sample = value as Record<string, unknown>;
  return typeof sample.id === 'string' && typeof sample.city === 'string' &&
    typeof sample.population === 'number' && Number.isFinite(sample.population) && sample.population > 0 &&
    Array.isArray(sample.observations) && sample.observations.length > 0 &&
    sample.observations.every((entry: unknown) => {
      if (typeof entry !== 'object' || entry === null) return false;
      const observation = entry as Record<string, unknown>;
      return typeof observation.good === 'string' &&
        typeof observation.total === 'number' && Number.isFinite(observation.total) && observation.total >= 0 &&
        typeof observation.industry === 'number' && Number.isFinite(observation.industry) &&
        observation.industry >= 0 && observation.total >= observation.industry;
    });
}