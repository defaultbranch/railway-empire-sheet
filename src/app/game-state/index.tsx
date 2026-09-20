import { useState, type ReactNode } from 'react';
import { getInitialGameState } from '../initial-state';
import { GoodsProvider } from './goods-state';
import { RuralBusinessProvider } from './rural-business-state';
import { IndustryProvider } from './industry-state';
import { DemandsProvider } from './demands-state';

export * from './types';
export { GoodsProvider, useGoods } from './goods-state';
export { RuralBusinessProvider, useRuralBusinessTypes } from './rural-business-state';
export { IndustryProvider, useIndustryTypes } from './industry-state';
export { DemandsProvider, useDemands } from './demands-state';

// composes the independent dimensions, each keeping its own state, wired to a single initial load
export function GameStateProvider({ children }: { children: ReactNode }) {
  const [initialState] = useState(getInitialGameState);

  return (
    <GoodsProvider initialGoods={initialState.goods}>
      <RuralBusinessProvider initialTypes={initialState.ruralBusinessTypes}>
        <IndustryProvider initialTypes={initialState.industryTypes}>
          <DemandsProvider initialDemands={initialState.demands}>{children}</DemandsProvider>
        </IndustryProvider>
      </RuralBusinessProvider>
    </GoodsProvider>
  );
}
