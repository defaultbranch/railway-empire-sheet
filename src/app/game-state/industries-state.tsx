import { createContext, useContext, useState, type ReactNode } from 'react';
import type { BusinessLevel, Industry, IndustrySlot } from './types';

export type IndustriesState = {
  industries: Industry[];
  addIndustry: (industry: Industry) => void;
  removeIndustry: (city: string, citySlot: IndustrySlot) => void;
  setIndustryLevel: (city: string, citySlot: IndustrySlot, level: BusinessLevel) => void;
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
      prev.some((existing) => existing.city === industry.city && existing.citySlot === industry.citySlot)
        ? prev
        : [...prev, industry],
    );
  };

  const removeIndustry = (city: string, citySlot: IndustrySlot) => {
    setIndustries((prev) => prev.filter((existing) => !(existing.city === city && existing.citySlot === citySlot)));
  };

  const setIndustryLevel = (city: string, citySlot: IndustrySlot, level: BusinessLevel) => {
    setIndustries((prev) =>
      prev.map((existing) =>
        existing.city === city && existing.citySlot === citySlot ? { ...existing, level } : existing,
      ),
    );
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
