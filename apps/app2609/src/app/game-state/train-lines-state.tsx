import { createContext, useContext, useState, type ReactNode } from 'react';
import type { TrainLine } from './types';
import { trainLineSlug } from '../entities/train-line-routes';

export type TrainLineDetails = { name: string; days?: number; trains?: number };

export function removeTrainLinesUsingStation(lines: TrainLine[], stationName: string): TrainLine[] {
  return lines.filter((line) => !line.stops.some((stop) => stop.kind === 'station' && stop.name === stationName));
}

export function updateTrainLineDetails(lines: TrainLine[], name: string, details: TrainLineDetails): TrainLine[] {
  const line = lines.find((existing) => existing.name === name);
  const nextName = details.name.trim();
  const slug = trainLineSlug({ name: nextName });
  if (line === undefined || !slug || lines.some((existing) => existing !== line && trainLineSlug(existing) === slug)) {
    return lines;
  }
  if (details.days !== undefined && (!Number.isFinite(details.days) || details.days <= 0)) return lines;
  if (line.type === 'ContinuousTrainLine' &&
    (details.trains === undefined || !Number.isSafeInteger(details.trains) || details.trains < 0)) return lines;

  return lines.map((existing) => existing !== line ? existing : line.type === 'ContinuousTrainLine'
    ? { ...line, name: nextName, tourDays: details.days, trains: details.trains! }
    : { ...line, name: nextName, travelDays: details.days });
}

export function convertTrainLineService(line: TrainLine): TrainLine | undefined {
  const { name, stops, cargo } = line;
  if (line.type === 'OnDemandTrainLine') {
    return {
      type: 'ContinuousTrainLine',
      name,
      stops,
      cargo,
      trains: 1,
      tourDays: line.travelDays === undefined ? undefined : line.travelDays * 2,
    };
  }

  if (stops.length !== 2) return undefined;
  return {
    type: 'OnDemandTrainLine',
    name,
    stops: [stops[0], stops[1]],
    cargo,
    travelDays: line.tourDays !== undefined && Number.isFinite(line.tourDays) && line.tourDays > 0
      ? line.tourDays / 2 : undefined,
  };
}

export type TrainLinesState = {
  trainLines: TrainLine[];
  addTrainLine: (line: TrainLine) => void;
  removeTrainLine: (name: string) => void;
  removeTrainLinesUsingStation: (stationName: string) => void;
  convertTrainLine: (name: string) => void;
  updateTrainLine: (name: string, details: TrainLineDetails) => void;
  replaceTrainLines: (lines: TrainLine[]) => void;
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

  const removeLinesUsingStation = (stationName: string) => {
    setTrainLines((prev) => removeTrainLinesUsingStation(prev, stationName));
  };

  const convertTrainLine = (name: string) => {
    setTrainLines((prev) => prev.map((line) => line.name === name ? convertTrainLineService(line) ?? line : line));
  };

  const replaceTrainLines = (lines: TrainLine[]) => {
    setTrainLines(lines);
  };

  const updateTrainLine = (name: string, details: TrainLineDetails) => {
    setTrainLines((prev) => updateTrainLineDetails(prev, name, details));
  };

  return (
    <TrainLinesContext.Provider value={{ trainLines, addTrainLine, removeTrainLine, removeTrainLinesUsingStation: removeLinesUsingStation, convertTrainLine, updateTrainLine, replaceTrainLines }}>
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
