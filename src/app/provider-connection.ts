export type ProviderConnection = {

  ruralProducer: string;
  good: string;
  destinationCity: string;

  productionFactor?: number;
  demandFactor?: number;
  lastRun?: Date;
};
