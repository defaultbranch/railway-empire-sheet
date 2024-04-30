import { Good, Line } from "./alt-model";
import { weeklyConsumption } from "./weekly-consumption";
import { weeklyProduction } from "./weekly-production";

export const weeklyTurnOver
  : (line: Line, good: Good) => number
  = (line, good) => {
    switch (line.type) {
      case 'OneShotLine':
        return Math.min(
          weeklyProduction(line.producer, good) * line.productionShare,
          weeklyConsumption(line.consumer, good) * line.consumptionShare
        );
      case 'CirculatingLine':
        return Math.min(
          weeklyProduction(line.producer, good) * line.productionShare,
          weeklyConsumption(line.consumer, good) * line.consumptionShare,
          56 * line.trains / line.cycleDays,
        );
      default:
        throw new Error(`not implemented: ${line.type}`);
    }
  }
