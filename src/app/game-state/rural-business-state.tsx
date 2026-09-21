import { createContext, useContext, useState, type ReactNode } from 'react';
import type { BusinessLevel, RuralBusinessType } from './types';

export type RuralBusinessState = {
  ruralBusinessTypes: RuralBusinessType[];
  addRuralBusinessType: (type: RuralBusinessType) => void;
  removeRuralBusinessType: (name: string) => void;
  setRuralBusinessProduction: (name: string, level: BusinessLevel, amount: number | undefined) => void;
  setRuralBusinessSetupCostBasis: (name: string, setupCostBasis: number | undefined) => void;
};

const RuralBusinessContext = createContext<RuralBusinessState | undefined>(undefined);

export function RuralBusinessProvider({
  initialTypes,
  children,
}: {
  initialTypes: RuralBusinessType[];
  children: ReactNode;
}) {
  const [ruralBusinessTypes, setRuralBusinessTypes] = useState<RuralBusinessType[]>(initialTypes);

  const addRuralBusinessType = (type: RuralBusinessType) => {
    setRuralBusinessTypes((prev) =>
      prev.some((existing) => existing.name === type.name) ? prev : [...prev, type],
    );
  };

  const removeRuralBusinessType = (name: string) => {
    setRuralBusinessTypes((prev) => prev.filter((existing) => existing.name !== name));
  };

  const setRuralBusinessProduction = (name: string, level: BusinessLevel, amount: number | undefined) => {
    setRuralBusinessTypes((prev) =>
      prev.map((existing) =>
        existing.name === name
          ? { ...existing, productionByLevel: { ...existing.productionByLevel, [level]: amount } }
          : existing,
      ),
    );
  };

  const setRuralBusinessSetupCostBasis = (name: string, setupCostBasis: number | undefined) => {
    setRuralBusinessTypes((prev) =>
      prev.map((existing) => (existing.name === name ? { ...existing, setupCostBasis } : existing)),
    );
  };

  return (
    <RuralBusinessContext.Provider
      value={{
        ruralBusinessTypes,
        addRuralBusinessType,
        removeRuralBusinessType,
        setRuralBusinessProduction,
        setRuralBusinessSetupCostBasis,
      }}
    >
      {children}
    </RuralBusinessContext.Provider>
  );
}

export function useRuralBusinessTypes() {
  const context = useContext(RuralBusinessContext);
  if (context === undefined) {
    throw new Error('useRuralBusinessTypes must be used within a RuralBusinessProvider');
  }
  return context;
}
