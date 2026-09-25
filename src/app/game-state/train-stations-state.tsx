import { createContext, useContext, useState, type ReactNode } from 'react';
import type { TrainStation } from './types';

export type TrainStationsState = {
  trainStations: TrainStation[];
  addTrainStation: (station: TrainStation) => void;
  removeTrainStation: (name: string) => void;
};

const TrainStationsContext = createContext<TrainStationsState | undefined>(undefined);

export function TrainStationsProvider({
  initialTrainStations,
  children,
}: {
  initialTrainStations: TrainStation[];
  children: ReactNode;
}) {
  const [trainStations, setTrainStations] = useState<TrainStation[]>(initialTrainStations);

  const addTrainStation = (station: TrainStation) => {
    setTrainStations((prev) =>
      prev.some((existing) => existing.name === station.name) ? prev : [...prev, station],
    );
  };

  const removeTrainStation = (name: string) => {
    setTrainStations((prev) => prev.filter((existing) => existing.name !== name));
  };

  return (
    <TrainStationsContext.Provider value={{ trainStations, addTrainStation, removeTrainStation }}>
      {children}
    </TrainStationsContext.Provider>
  );
}

export function useTrainStations() {
  const context = useContext(TrainStationsContext);
  if (context === undefined) {
    throw new Error('useTrainStations must be used within a TrainStationsProvider');
  }
  return context;
}
