import type { GameState } from '../game-state/types';
import { compileFlowNetwork } from './compile-network';
import { defaultSolveOptions, solveFlowNetwork } from './solve-flow';
import type { FlowNetwork, FlowSolution, SolveOptions } from './solver-types';

export type GoodsFlow = {
  network: FlowNetwork;
  solution: FlowSolution;
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

  return { network, solution: { ...solved, missingCoefficients }, droppedLines };
}
