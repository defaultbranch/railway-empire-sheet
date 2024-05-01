import { Good, Line } from "./alt-model";
import { weeklyConsumption } from "./weekly-consumption";
import { weeklyProduction } from "./weekly-production";

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
          weeklyProduction(line.producer, good) * line.nominalProductionShare,
          weeklyConsumption(line.consumer, good) * line.nominalConsumptionShare,
          56 * line.trains / line.meanCycleDays,
        );
      default:
        throw new Error(`not implemented: ${line.type}`);
    }
  }
