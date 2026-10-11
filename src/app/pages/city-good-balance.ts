import type { Good } from '../game-state/types';
import type { FlowNetwork, FlowSolution } from '../solver/solver-types';

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
