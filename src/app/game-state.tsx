import { createContext, useContext, useState, type ReactNode } from 'react';

export type Good = string;

export const businessLevels = [1, 2, 3, 4, 5] as const;
export type BusinessLevel = (typeof businessLevels)[number];

export type RuralBusinessType = {
  name: string;
  good: Good;
  // per-level production is only known once a business of this type reaches that level
  productionByLevel: Record<BusinessLevel, number | undefined>;
};

export type GameState = {
  goods: Good[];
  ruralBusinessTypes: RuralBusinessType[];
};

export type GameStateActions = {
  addGood: (good: Good) => void;
  removeGood: (good: Good) => void;
  addRuralBusinessType: (type: RuralBusinessType) => void;
  removeRuralBusinessType: (name: string) => void;
  setRuralBusinessProduction: (name: string, level: BusinessLevel, amount: number | undefined) => void;
};

const GameStateContext = createContext<(GameState & GameStateActions) | undefined>(undefined);

function emptyProductionByLevel(): Record<BusinessLevel, number | undefined> {
  return { 1: undefined, 2: undefined, 3: undefined, 4: undefined, 5: undefined };
}

export function GameStateProvider({ children }: { children: ReactNode }) {
  const [goods, setGoods] = useState<Good[]>([]);
  const [ruralBusinessTypes, setRuralBusinessTypes] = useState<RuralBusinessType[]>([]);

  const addGood = (good: Good) => {
    setGoods((prev) => (prev.includes(good) ? prev : [...prev, good]));
  };

  const removeGood = (good: Good) => {
    setGoods((prev) => prev.filter((existing) => existing !== good));
  };

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

  return (
    <GameStateContext.Provider
      value={{
        goods,
        ruralBusinessTypes,
        addGood,
        removeGood,
        addRuralBusinessType,
        removeRuralBusinessType,
        setRuralBusinessProduction,
      }}
    >
      {children}
    </GameStateContext.Provider>
  );
}

export { emptyProductionByLevel };

export function useGameState() {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
}
