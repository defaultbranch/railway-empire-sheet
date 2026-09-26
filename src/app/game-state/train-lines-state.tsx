import { createContext, useContext, useState, type ReactNode } from 'react';
import type { TrainLine } from './types';

export type TrainLinesState = {
  trainLines: TrainLine[];
  addTrainLine: (line: TrainLine) => void;
  removeTrainLine: (name: string) => void;
};

const TrainLinesContext = createContext<TrainLinesState | undefined>(undefined);

export function TrainLinesProvider({
  initialTrainLines,
  children,
}: {
  initialTrainLines: TrainLine[];
  children: ReactNode;
}) {
  const [trainLines, setTrainLines] = useState<TrainLine[]>(initialTrainLines);

  const addTrainLine = (line: TrainLine) => {
    setTrainLines((prev) => (prev.some((existing) => existing.name === line.name) ? prev : [...prev, line]));
  };

  const removeTrainLine = (name: string) => {
    setTrainLines((prev) => prev.filter((existing) => existing.name !== name));
  };

  return (
    <TrainLinesContext.Provider value={{ trainLines, addTrainLine, removeTrainLine }}>
      {children}
    </TrainLinesContext.Provider>
  );
}

export function useTrainLines() {
  const context = useContext(TrainLinesContext);
  if (context === undefined) {
    throw new Error('useTrainLines must be used within a TrainLinesProvider');
  }
  return context;
}
