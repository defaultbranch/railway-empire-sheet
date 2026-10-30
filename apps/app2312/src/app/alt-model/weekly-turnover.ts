import { Good, Line } from "./alt-model";
import { weeklyConsumption } from "./weekly-consumption";
import { weeklyProduction } from "./weekly-production";

const DAYS_PER_WEEK = 7;

export const weeklyTurnOver
  : (line: Line, good: Good) => number
  = (line, good) => {
    switch (line.type) {
      case 'OneShotLine':
        return Math.min(
          weeklyProduction(line.producer, good) * line.nominalProductionShare,
          weeklyConsumption(line.consumer, good) * line.nominalConsumptionShare
        );
      case 'CirculatingLine':
        return Math.min(
          weeklyProduction(line.producer, good),
          weeklyConsumption(line.consumer, good),
          line.trains / line.meanCycleDays * DAYS_PER_WEEK * (line.weeklyVolume[good] ?? 0),
        );
      default:
        throw new Error(`not implemented: ${line.type}`);
    }
  }
