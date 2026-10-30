import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { defaultGameState, emptyGameState } from '../initial-state';
import { saveGameStateToStorage, serializeGameState } from './persistence';
import type { GameState } from './types';
import { useGoods } from './goods-state';
import { useRuralBusinessTypes } from './rural-business-state';
import { useRuralBusinesses } from './rural-businesses-state';
import { useIndustryTypes } from './industry-state';
import { useIndustries } from './industries-state';
import { useDemands } from './demands-state';
import { useCities } from './city-state';
import { useTrainStations } from './train-stations-state';
import { useWarehouses } from './warehouses-state';
import { useTrainLines } from './train-lines-state';

export type GameActionsState = {
  exportGameState: () => string;
  replaceGameState: (state: GameState) => void;
  resetToDefault: () => void;
  wipeToEmpty: () => void;
};

const GameActionsContext = createContext<GameActionsState | undefined>(undefined);

// lives inside every slice provider: mirrors their combined state to localStorage, and exposes
// reset/wipe actions that replace every slice at once
export function GameStatePersistence({ children }: { children: ReactNode }) {
  const goods = useGoods();
  const ruralBusinessTypes = useRuralBusinessTypes();
  const ruralBusinesses = useRuralBusinesses();
  const industryTypes = useIndustryTypes();
  const industries = useIndustries();
  const demands = useDemands();
  const cities = useCities();
  const trainStations = useTrainStations();
  const warehouses = useWarehouses();
  const trainLines = useTrainLines();

  const currentState: GameState = useMemo(
    () => ({
      goods: goods.goods,
      ruralBusinessTypes: ruralBusinessTypes.ruralBusinessTypes,
      industryTypes: industryTypes.industryTypes,
      demands: demands.demands,
      cities: cities.cities,
      ruralBusinesses: ruralBusinesses.ruralBusinesses,
      industries: industries.industries,
      trainStations: trainStations.trainStations,
      warehouses: warehouses.warehouses,
      trainLines: trainLines.trainLines,
    }),
    [
      goods.goods,
      ruralBusinessTypes.ruralBusinessTypes,
      ruralBusinesses.ruralBusinesses,
      industryTypes.industryTypes,
      industries.industries,
      demands.demands,
      cities.cities,
      trainStations.trainStations,
      warehouses.warehouses,
      trainLines.trainLines,
    ],
  );

  useEffect(() => {
    saveGameStateToStorage(currentState);
  }, [currentState]);

  const applyState = (state: GameState) => {
    goods.replaceGoods(state.goods);
    ruralBusinessTypes.replaceRuralBusinessTypes(state.ruralBusinessTypes);
    ruralBusinesses.replaceRuralBusinesses(state.ruralBusinesses);
    industryTypes.replaceIndustryTypes(state.industryTypes);
    industries.replaceIndustries(state.industries);
    demands.replaceDemands(state.demands);
    cities.replaceCities(state.cities);
    trainStations.replaceTrainStations(state.trainStations);
    warehouses.replaceWarehouses(state.warehouses);
    trainLines.replaceTrainLines(state.trainLines);
  };

  const resetToDefault = () => applyState(defaultGameState());
  const wipeToEmpty = () => applyState(emptyGameState());
  const replaceGameState = (state: GameState) => applyState(state);
  const exportGameState = () => serializeGameState(currentState);

  return (
    <GameActionsContext.Provider value={{ exportGameState, replaceGameState, resetToDefault, wipeToEmpty }}>
      {children}
    </GameActionsContext.Provider>
  );
}

export function useGameActions() {
  const context = useContext(GameActionsContext);
  if (context === undefined) {
    throw new Error('useGameActions must be used within a GameStatePersistence');
  }
  return context;
}
