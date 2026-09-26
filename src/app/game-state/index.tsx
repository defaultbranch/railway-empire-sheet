import { useState, type ReactNode } from 'react';
import { getInitialGameState } from '../initial-state';
import { GoodsProvider } from './goods-state';
import { RuralBusinessProvider } from './rural-business-state';
import { RuralBusinessesProvider } from './rural-businesses-state';
import { IndustryProvider } from './industry-state';
import { IndustriesProvider } from './industries-state';
import { DemandsProvider } from './demands-state';
import { CityProvider } from './city-state';
import { TrainStationsProvider } from './train-stations-state';
import { WarehousesProvider } from './warehouses-state';
import { TrainLinesProvider } from './train-lines-state';

export * from './types';
export { GoodsProvider, useGoods } from './goods-state';
export { RuralBusinessProvider, useRuralBusinessTypes } from './rural-business-state';
export { RuralBusinessesProvider, useRuralBusinesses } from './rural-businesses-state';
export { IndustryProvider, useIndustryTypes } from './industry-state';
export { IndustriesProvider, useIndustries } from './industries-state';
export { DemandsProvider, useDemands } from './demands-state';
export { CityProvider, useCities } from './city-state';
export { TrainStationsProvider, useTrainStations } from './train-stations-state';
export { WarehousesProvider, useWarehouses } from './warehouses-state';
export { TrainLinesProvider, useTrainLines } from './train-lines-state';

// composes the independent dimensions, each keeping its own state, wired to a single initial load
export function GameStateProvider({ children }: { children: ReactNode }) {
  const [initialState] = useState(getInitialGameState);

  return (
    <GoodsProvider initialGoods={initialState.goods}>
      <RuralBusinessProvider initialTypes={initialState.ruralBusinessTypes}>
        <RuralBusinessesProvider initialBusinesses={initialState.ruralBusinesses}>
          <IndustryProvider initialTypes={initialState.industryTypes}>
            <IndustriesProvider initialIndustries={initialState.industries}>
              <DemandsProvider initialDemands={initialState.demands}>
                <CityProvider initialCities={initialState.cities}>
                  <TrainStationsProvider initialTrainStations={initialState.trainStations}>
                    <WarehousesProvider initialWarehouses={initialState.warehouses}>
                      <TrainLinesProvider initialTrainLines={initialState.trainLines}>{children}</TrainLinesProvider>
                    </WarehousesProvider>
                  </TrainStationsProvider>
                </CityProvider>
              </DemandsProvider>
            </IndustriesProvider>
          </IndustryProvider>
        </RuralBusinessesProvider>
      </RuralBusinessProvider>
    </GoodsProvider>
  );
}
