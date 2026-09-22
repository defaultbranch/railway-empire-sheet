import { createContext, useContext, useState, type ReactNode } from 'react';
import type { City } from './types';

export type CityState = {
  cities: City[];
  addCity: (name: string) => void;
  removeCity: (name: string) => void;
  setCityPopulation: (name: string, population: number) => void;
};

const CityContext = createContext<CityState | undefined>(undefined);

export function CityProvider({ initialCities, children }: { initialCities: City[]; children: ReactNode }) {
  const [cities, setCities] = useState<City[]>(initialCities);

  const addCity = (name: string) => {
    setCities((prev) => (prev.some((existing) => existing.name === name) ? prev : [...prev, { name, population: 0 }]));
  };

  const removeCity = (name: string) => {
    setCities((prev) => prev.filter((existing) => existing.name !== name));
  };

  const setCityPopulation = (name: string, population: number) => {
    setCities((prev) => prev.map((existing) => (existing.name === name ? { ...existing, population } : existing)));
  };

  return (
    <CityContext.Provider value={{ cities, addCity, removeCity, setCityPopulation }}>{children}</CityContext.Provider>
  );
}

export function useCities() {
  const context = useContext(CityContext);
  if (context === undefined) {
    throw new Error('useCities must be used within a CityProvider');
  }
  return context;
}
