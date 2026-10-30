import { useMemo } from 'react';
import { useCities } from '../game-state/city-state';
import { useDemands } from '../game-state/demands-state';
import { useGoods } from '../game-state/goods-state';
import { useIndustries } from '../game-state/industries-state';
import { useIndustryTypes } from '../game-state/industry-state';
import { useRuralBusinesses } from '../game-state/rural-businesses-state';
import { useRuralBusinessTypes } from '../game-state/rural-business-state';
import { useTrainLines } from '../game-state/train-lines-state';
import { useTrainStations } from '../game-state/train-stations-state';
import { useWarehouses } from '../game-state/warehouses-state';
import { solveGoodsFlow, type GoodsFlow } from './solve-goods-flow';

// one solve shared by every view that reads goods flow, recomputed only when the game state changes
export function useGoodsFlow(): GoodsFlow {
  const { goods } = useGoods();
  const { ruralBusinessTypes } = useRuralBusinessTypes();
  const { industryTypes } = useIndustryTypes();
  const { demands } = useDemands();
  const { cities } = useCities();
  const { ruralBusinesses } = useRuralBusinesses();
  const { industries } = useIndustries();
  const { trainStations } = useTrainStations();
  const { warehouses } = useWarehouses();
  const { trainLines } = useTrainLines();

  return useMemo(
    () =>
      solveGoodsFlow({
        goods,
        ruralBusinessTypes,
        industryTypes,
        demands,
        cities,
        ruralBusinesses,
        industries,
        trainStations,
        warehouses,
        trainLines,
      }),
    [
      goods,
      ruralBusinessTypes,
      industryTypes,
      demands,
      cities,
      ruralBusinesses,
      industries,
      trainStations,
      warehouses,
      trainLines,
    ],
  );
}
