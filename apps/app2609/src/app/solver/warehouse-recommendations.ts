import { warehouseGoodSlotsByTracks, type Good, type TrainLine, type Warehouse } from '../game-state/types.ts';
import type { GoodsFlow } from './solve-goods-flow';
import { solveFlowNetwork } from './solve-flow.ts';
import { analyzeTransportRevenue } from './transport-revenue.ts';

export type WarehouseGoodSimulation = {
  good: Good;
  weeklyYieldChange: number;
  converged: boolean;
};

export function simulateWarehouseGoods(
  baseline: GoodsFlow,
  warehouse: Warehouse,
  trainLines: TrainLine[],
): WarehouseGoodSimulation[] {
  if (warehouse.goods.length >= warehouseGoodSlotsByTracks[warehouse.tracks]) return [];
  const nodeId = `warehouse:${warehouse.name}`;
  if (!baseline.network.nodes.some((node) => node.id === nodeId)) return [];
  const connectedLines = new Set(baseline.network.legs
    .filter((leg) => leg.from === nodeId || leg.to === nodeId)
    .map((leg) => leg.line));
  if (connectedLines.size === 0) return [];
  const connectedYield = (revenue: GoodsFlow['revenue']) => revenue.lines
    .filter((line) => connectedLines.has(line.line))
    .reduce((sum, line) => sum + line.weeklyYield, 0);
  const baselineYield = connectedYield(baseline.revenue);

  return baseline.network.goods.filter((good) => !warehouse.goods.includes(good)).map((good) => {
    const network = {
      ...baseline.network,
      nodes: baseline.network.nodes.map((node) => node.id === nodeId ? {
        ...node,
        loadableGoods: new Set([...node.loadableGoods, good]),
        unloadableGoods: new Set([...node.unloadableGoods, good]),
      } : node),
    };
    const solution = solveFlowNetwork(network);
    const revenue = analyzeTransportRevenue(network, solution, trainLines);
    return { good, weeklyYieldChange: connectedYield(revenue) - baselineYield, converged: solution.converged };
  }).sort((left, right) => right.weeklyYieldChange - left.weeklyYieldChange || left.good.localeCompare(right.good));
}
