import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Demand, Good } from './types';
import type { DemandSample } from '../pages/demand-estimation';

export type DemandsState = {
  demands: Demand[];
  demandSamples: DemandSample[];
  addDemandSample: (sample: DemandSample) => void;
  removeDemandSample: (id: string) => void;
  replaceDemandSamples: (samples: DemandSample[]) => void;
  addDemand: (good: Good) => void;
  removeDemand: (good: Good) => void;
  setDemandMinPopulation: (good: Good, minPopulation: number) => void;
  setDemandWagonsPerMillion: (good: Good, wagonsPerMillion: number) => void;
  replaceDemands: (demands: Demand[]) => void;
};

const DemandsContext = createContext<DemandsState | undefined>(undefined);

export function DemandsProvider({ initialDemands, initialDemandSamples = [], children }: {
  initialDemands: Demand[]; initialDemandSamples?: DemandSample[]; children: ReactNode;
}) {
  const [demands, setDemands] = useState<Demand[]>(initialDemands);
  const [demandSamples, setDemandSamples] = useState<DemandSample[]>(initialDemandSamples);
  const addDemandSample = (sample: DemandSample) => setDemandSamples((previous) => [...previous, sample]);
  const removeDemandSample = (id: string) => setDemandSamples((previous) => previous.filter((sample) => sample.id !== id));

  const addDemand = (good: Good) => {
    setDemands((prev) =>
      prev.some((existing) => existing.good === good) ? prev : [...prev, { good, minPopulation: 0, wagonsPerMillion: 0 }],
    );
  };

  const removeDemand = (good: Good) => {
    setDemands((prev) => prev.filter((existing) => existing.good !== good));
  };

  const setDemandMinPopulation = (good: Good, minPopulation: number) => {
    setDemands((prev) => prev.map((existing) => (existing.good === good ? { ...existing, minPopulation } : existing)));
  };

  const setDemandWagonsPerMillion = (good: Good, wagonsPerMillion: number) => {
    setDemands((prev) =>
      prev.map((existing) => (existing.good === good ? { ...existing, wagonsPerMillion } : existing)),
    );
  };

  const replaceDemands = (demands: Demand[]) => {
    setDemands(demands);
  };

  return (
    <DemandsContext.Provider
      value={{ demands, addDemand, removeDemand, setDemandMinPopulation, setDemandWagonsPerMillion, replaceDemands,
        demandSamples, addDemandSample, removeDemandSample, replaceDemandSamples: setDemandSamples }}
    >
      {children}
    </DemandsContext.Provider>
  );
}

export function useDemands() {
  const context = useContext(DemandsContext);
  if (context === undefined) {
    throw new Error('useDemands must be used within a DemandsProvider');
  }
  return context;
}
