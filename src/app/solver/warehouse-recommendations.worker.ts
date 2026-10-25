import { simulateWarehouseGoods } from './warehouse-recommendations.ts';
import type { Warehouse, TrainLine } from '../game-state/types.ts';
import type { GoodsFlow } from './solve-goods-flow.ts';

export type WarehouseRecommendationsRequest = {
  baseline: GoodsFlow;
  warehouse: Warehouse;
  trainLines: TrainLine[];
};

addEventListener('message', (event: MessageEvent<WarehouseRecommendationsRequest>) => {
  const { baseline, warehouse, trainLines } = event.data;
  postMessage(simulateWarehouseGoods(baseline, warehouse, trainLines));
});
