import { createContext, useContext, useState, type ReactNode } from 'react';
import type { BusinessLevel, RuralBusiness } from './types';

export type RuralBusinessesState = {
  ruralBusinesses: RuralBusiness[];
  addRuralBusiness: (business: RuralBusiness) => void;
  removeRuralBusiness: (name: string) => void;
  setRuralBusinessLevel: (name: string, level: BusinessLevel) => void;
};

const RuralBusinessesContext = createContext<RuralBusinessesState | undefined>(undefined);

export function RuralBusinessesProvider({
  initialBusinesses,
  children,
}: {
  initialBusinesses: RuralBusiness[];
  children: ReactNode;
}) {
  const [ruralBusinesses, setRuralBusinesses] = useState<RuralBusiness[]>(initialBusinesses);

  const addRuralBusiness = (business: RuralBusiness) => {
    setRuralBusinesses((prev) =>
      prev.some((existing) => existing.name === business.name) ? prev : [...prev, business],
    );
  };

  const removeRuralBusiness = (name: string) => {
    setRuralBusinesses((prev) => prev.filter((existing) => existing.name !== name));
  };

  const setRuralBusinessLevel = (name: string, level: BusinessLevel) => {
    setRuralBusinesses((prev) =>
      prev.map((existing) => (existing.name === name ? { ...existing, level } : existing)),
    );
  };

  return (
    <RuralBusinessesContext.Provider
      value={{ ruralBusinesses, addRuralBusiness, removeRuralBusiness, setRuralBusinessLevel }}
    >
      {children}
    </RuralBusinessesContext.Provider>
  );
}

export function useRuralBusinesses() {
  const context = useContext(RuralBusinessesContext);
  if (context === undefined) {
    throw new Error('useRuralBusinesses must be used within a RuralBusinessesProvider');
  }
  return context;
}
