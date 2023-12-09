export type DirectLine = {

  ruralProducer: string;
  good: string;
  destinationCity: string;
  miles: number;
  cost: number;

  productionFactor?: number;
  demandFactor?: number;
  lastRun?: Date;
};
