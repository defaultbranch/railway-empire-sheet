import { createContext, useContext, useState, type ReactNode } from 'react';
import type { ContinuousTrainLine } from './types';

export type TrainLinesState = {
  trainLines: ContinuousTrainLine[];
  addTrainLine: (line: ContinuousTrainLine) => void;
  removeTrainLine: (name: string) => void;
  replaceTrainLines: (lines: ContinuousTrainLine[]) => void;
};

const TrainLinesContext = createContext<TrainLinesState | undefined>(undefined);

export function TrainLinesProvider({
  initialTrainLines,
  children,
}: {
  initialTrainLines: ContinuousTrainLine[];
  children: ReactNode;
}) {
  const [trainLines, setTrainLines] = useState<ContinuousTrainLine[]>(initialTrainLines);

  const addTrainLine = (line: ContinuousTrainLine) => {
    setTrainLines((prev) => (prev.some((existing) => existing.name === line.name) ? prev : [...prev, line]));
  };

  const removeTrainLine = (name: string) => {
    setTrainLines((prev) => prev.filter((existing) => existing.name !== name));
  };

  const replaceTrainLines = (lines: ContinuousTrainLine[]) => {
    setTrainLines(lines);
  };

  return (
    <TrainLinesContext.Provider value={{ trainLines, addTrainLine, removeTrainLine, replaceTrainLines }}>
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
