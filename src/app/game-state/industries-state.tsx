import { createContext, useContext, useState, type ReactNode } from 'react';
import type { BusinessLevel, Industry, IndustrySlot } from './types';

export type IndustriesState = {
  industries: Industry[];
  addIndustry: (industry: Industry) => void;
  removeIndustry: (city: string, citySlot: IndustrySlot) => void;
  setIndustryType: (city: string, citySlot: IndustrySlot, typeName: string | undefined) => void;
  setIndustryLevel: (city: string, citySlot: IndustrySlot, level: BusinessLevel) => void;
  replaceIndustries: (industries: Industry[]) => void;
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

  const setIndustryType = (city: string, citySlot: IndustrySlot, typeName: string | undefined) => {
    setIndustries((prev) => {
      const existing = prev.find((industry) => industry.city === city && industry.citySlot === citySlot);
      if (typeName === undefined) {
        return prev.filter((industry) => !(industry.city === city && industry.citySlot === citySlot));
      }
      if (existing !== undefined) {
        return prev.map((industry) =>
          industry.city === city && industry.citySlot === citySlot ? { ...industry, typeName } : industry,
        );
      }
      return [...prev, { city, citySlot, typeName, level: 1 }];
    });
  };

  const setIndustryLevel = (city: string, citySlot: IndustrySlot, level: BusinessLevel) => {
    setIndustries((prev) =>
      prev.map((existing) =>
        existing.city === city && existing.citySlot === citySlot ? { ...existing, level } : existing,
      ),
    );
  };

  const replaceIndustries = (industries: Industry[]) => {
    setIndustries(industries);
  };

  return (
    <IndustriesContext.Provider
      value={{ industries, addIndustry, removeIndustry, setIndustryType, setIndustryLevel, replaceIndustries }}
    >
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
