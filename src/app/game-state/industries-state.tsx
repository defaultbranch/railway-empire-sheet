import { createContext, useContext, useState, type ReactNode } from 'react';
import type { BusinessLevel, Industry } from './types';

export type IndustriesState = {
  industries: Industry[];
  addIndustry: (industry: Industry) => void;
  removeIndustry: (name: string) => void;
  setIndustryLevel: (name: string, level: BusinessLevel) => void;
};

const IndustriesContext = createContext<IndustriesState | undefined>(undefined);

export function IndustriesProvider({
  initialIndustries,
  children,
}: {
  initialIndustries: Industry[];
  children: ReactNode;
}) {
  const [industries, setIndustries] = useState<Industry[]>(initialIndustries);

  const addIndustry = (industry: Industry) => {
    setIndustries((prev) =>
      prev.some((existing) => existing.name === industry.name) ? prev : [...prev, industry],
    );
  };

  const removeIndustry = (name: string) => {
    setIndustries((prev) => prev.filter((existing) => existing.name !== name));
  };

  const setIndustryLevel = (name: string, level: BusinessLevel) => {
    setIndustries((prev) => prev.map((existing) => (existing.name === name ? { ...existing, level } : existing)));
  };

  return (
    <IndustriesContext.Provider value={{ industries, addIndustry, removeIndustry, setIndustryLevel }}>
      {children}
    </IndustriesContext.Provider>
  );
}

export function useIndustries() {
  const context = useContext(IndustriesContext);
  if (context === undefined) {
    throw new Error('useIndustries must be used within an IndustriesProvider');
  }
  return context;
}
