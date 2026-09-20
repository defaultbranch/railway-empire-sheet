import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Good } from './types';

export type GoodsState = {
  goods: Good[];
  addGood: (good: Good) => void;
  removeGood: (good: Good) => void;
};

const GoodsContext = createContext<GoodsState | undefined>(undefined);

export function GoodsProvider({ initialGoods, children }: { initialGoods: Good[]; children: ReactNode }) {
  const [goods, setGoods] = useState<Good[]>(initialGoods);

  const addGood = (good: Good) => {
    setGoods((prev) => (prev.includes(good) ? prev : [...prev, good]));
  };

  const removeGood = (good: Good) => {
    setGoods((prev) => prev.filter((existing) => existing !== good));
  };

  return <GoodsContext.Provider value={{ goods, addGood, removeGood }}>{children}</GoodsContext.Provider>;
}

export function useGoods() {
  const context = useContext(GoodsContext);
  if (context === undefined) {
    throw new Error('useGoods must be used within a GoodsProvider');
  }
  return context;
}
