import { createContext, useContext, useState, type ReactNode } from 'react';
import type { GameDate } from './types';

export type GameDateState = {
  gameDate: GameDate;
  setGameDate: (date: GameDate) => void;
};

const GameDateContext = createContext<GameDateState | undefined>(undefined);

export function GameDateProvider({ initialGameDate, children }: { initialGameDate: GameDate; children: ReactNode }) {
  const [gameDate, setGameDate] = useState(initialGameDate);

  return (
    <GameDateContext.Provider value={{ gameDate, setGameDate }}>
      {children}
    </GameDateContext.Provider>
  );
}

export function useGameDate() {
  const context = useContext(GameDateContext);
  if (context === undefined) {
    throw new Error('useGameDate must be used within a GameDateProvider');
  }
  return context;
}
