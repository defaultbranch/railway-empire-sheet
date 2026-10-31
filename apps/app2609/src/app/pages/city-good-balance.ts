import type { City, Demand, Good, Industry, IndustryType } from '../game-state/types';
import type { FlowNetwork, FlowSolution } from '@railway/shared';
import { cityPopulationDemandRows, type PopulationDemandSort } from './population-demand';

export type CityGoodDemandSort = {
  key: PopulationDemandSort['key'] | 'industryDemand' | 'maxIndustryDemand' | 'industryProduction' | 'maxIndustryProduction';
  descending: boolean;
};

export function formatIndustryAmount(actual: number, maximum: number | undefined): string {
  const amounts = `${actual.toFixed(2)} / ${maximum === undefined ? '?' : maximum.toFixed(2)}`;
  return maximum !== undefined && maximum > 0
    ? `${amounts} (${Math.round(100 * actual / maximum)}%)`
    : amounts;
}

export function cityGoodDemandRows(
  good: Good,
  cities: City[],
  demand: Demand | undefined,
  industries: Industry[],
  industryTypes: IndustryType[],
  solution: FlowSolution,
  sort: CityGoodDemandSort,
) {
  const populationRows = new Map((demand === undefined ? [] : cityPopulationDemandRows(
    demand, cities, solution, { key: 'city', descending: false },
  )).map((row) => [row.city.name, row]));
  const rows = cities.map((city) => {
    const cityIndustries = industries.filter((industry) => industry.city === city.name);
    const inputs = cityIndustries.flatMap((industry) => {
      const type = industryTypes.find((existing) => existing.name === industry.typeName);
      return (type?.rawMaterials ?? []).filter((flow) => flow.good === good)
        .map((flow) => ({ slot: industry.citySlot, amount: flow.amountByLevel[industry.level] }));
    });
    const outputs = cityIndustries.flatMap((industry) => {
      const type = industryTypes.find((existing) => existing.name === industry.typeName);
      return (type?.products ?? []).filter((flow) => flow.good === good)
        .map((flow) => ({ slot: industry.citySlot, amount: flow.amountByLevel[industry.level] }));
    });
    const slots = new Set(inputs.map((input) => input.slot));
    const industryDemand = solution.contributorFlows.filter((flow) => flow.good === good &&
      flow.contributor.kind === 'industry' && flow.contributor.city === city.name && slots.has(flow.contributor.slot))
      .reduce((sum, flow) => sum + flow.served, 0);
    const maxIndustryDemand = inputs.some((input) => input.amount === undefined)
      ? undefined : inputs.reduce((sum, input) => sum + (input.amount ?? 0), 0);
    const producerSlots = new Set(outputs.map((output) => output.slot));
    const industryProduction = solution.contributorFlows.filter((flow) => flow.good === good &&
      flow.contributor.kind === 'industry' && flow.contributor.city === city.name && producerSlots.has(flow.contributor.slot))
      .reduce((sum, flow) => sum + flow.served, 0);
    const maxIndustryProduction = outputs.some((output) => output.amount === undefined)
      ? undefined : outputs.reduce((sum, output) => sum + (output.amount ?? 0), 0);
    const population = populationRows.get(city.name);
    const unmet = population?.unmet ?? 0;
    return { city, amount: population?.amount ?? 0, unmet,
      industryDemand, maxIndustryDemand, industryProduction, maxIndustryProduction,
      hasIndustryDemand: inputs.length > 0, hasIndustryProduction: outputs.length > 0 };
  }).filter((row) => row.amount > 0 || row.hasIndustryDemand || row.hasIndustryProduction);
  return rows.sort((left, right) => {
    const direction = sort.descending ? -1 : 1;
    if (sort.key === 'city') return direction * left.city.name.localeCompare(right.city.name);
    const key = sort.key === 'demand' ? 'amount' : sort.key;
    const leftValue = left[key];
    const rightValue = right[key];
    if (leftValue === undefined && rightValue !== undefined) return 1;
    if (rightValue === undefined && leftValue !== undefined) return -1;
    return direction * ((leftValue ?? 0) - (rightValue ?? 0)) || left.city.name.localeCompare(right.city.name);
  });
}

export function suppliedToCityForGood(
  network: FlowNetwork,
  solution: FlowSolution,
  city: string,
  good: Good,
): number {
  const industrySlotsDemandingGood = new Set(
    network.nodes.flatMap((node) =>
      node.conversions.flatMap((conversion) =>
        conversion.contributor.kind === 'industry' &&
        conversion.contributor.city === city &&
        conversion.rawMaterials.some((rawMaterial) => rawMaterial.good === good)
          ? [conversion.contributor.slot]
          : [],
      ),
    ),
  );

  return solution.contributorFlows
    .filter((flow) => {
      if (flow.good !== good) return false;
      if (flow.contributor.kind === 'population') return flow.contributor.city === city;
      return (
        flow.contributor.kind === 'industry' &&
        flow.contributor.city === city &&
        industrySlotsDemandingGood.has(flow.contributor.slot)
      );
    })
    .reduce((total, flow) => total + flow.served, 0);
}
