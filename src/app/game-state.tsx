import { createContext, useContext, useState, type ReactNode } from 'react';

export type Good = string;

export type GameState = {
  goods: Good[];
};

export type GameStateActions = {
  addGood: (good: Good) => void;
  removeGood: (good: Good) => void;
};

const GameStateContext = createContext<(GameState & GameStateActions) | undefined>(undefined);

export function GameStateProvider({ children }: { children: ReactNode }) {
  const [goods, setGoods] = useState<Good[]>([]);

  const addGood = (good: Good) => {
    setGoods((prev) => (prev.includes(good) ? prev : [...prev, good]));
  };

  const removeGood = (good: Good) => {
    setGoods((prev) => prev.filter((existing) => existing !== good));
  };

  return (
    <GameStateContext.Provider value={{ goods, addGood, removeGood }}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameState() {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
}
