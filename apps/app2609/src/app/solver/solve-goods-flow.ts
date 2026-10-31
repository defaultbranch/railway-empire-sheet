import type { GameState } from '../game-state/types';
import { compileFlowNetwork } from './compile-network';
import { defaultSolveOptions, solveFlowNetwork, type FlowNetwork, type FlowSolution, type SolveOptions } from '@railway/shared';
import { analyzeTransportRevenue, type TransportRevenue } from './transport-revenue';

export type GoodsFlow = {
  network: FlowNetwork;
  solution: FlowSolution;
  revenue: TransportRevenue;
  // lines the network leaves out, so a view can say why a line shows no goods at all
  droppedLines: { line: string; reason: string }[];
};

export function solveGoodsFlow(state: GameState, options: SolveOptions = defaultSolveOptions): GoodsFlow {
  const { network, missingCoefficients, droppedLines } = compileFlowNetwork(state);

  for (const missing of missingCoefficients) {
    console.warn(
      `Goods flow solver: ${missing.typeName} has no figure for ${missing.good ?? 'an unnamed good'} at level ${missing.level}; leaving it out of the network.`,
    );
  }
  for (const dropped of droppedLines) {
    console.warn(`Goods flow solver: dropping line ${dropped.line} — ${dropped.reason}.`);
  }

  const solved = solveFlowNetwork(network, options);
  if (!solved.converged) {
    console.warn(`Goods flow solver: no convergence after ${solved.iterations} iterations.`);
  }

  const solution = { ...solved, missingCoefficients };
  return { network, solution, revenue: analyzeTransportRevenue(network, solution, state.trainLines), droppedLines };
}
