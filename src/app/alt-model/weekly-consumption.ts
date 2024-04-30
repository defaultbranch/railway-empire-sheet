import { CityPopulationDemand, Consumer, Good, IndustrialProductionCapacity, asConsumerProduct, throwUndefined } from "./alt-model";

export const weeklyConsumption
  : (consumer: Consumer, good: Good) => number
  = (consumer, good) => {
    switch (consumer.type) {
      case 'Factory': {
        const industry = IndustrialProductionCapacity[consumer.industryType];
        const matriasPrimas = industry.materiasPrimas as Readonly<Record<Good, Readonly<(number | undefined)[]>>>;
        const amounts = matriasPrimas[good];
        return amounts ? amounts[consumer.size - 1] ?? throwUndefined() : 0;
      }
      case 'City': {
        const demand = CityPopulationDemand[asConsumerProduct(good)] ?? throwUndefined();
        const populationConsumption = demand.minCityPopulation <= consumer.population ? demand.wagonsPerMillion * consumer.population * 1e-6 : 0;
        return populationConsumption + consumer.factories.reduce((total, factory) => { return total + (factory ? weeklyConsumption(factory, good) : 0) }, 0);
      }
      default: throw new Error(`not implemented: ${consumer.type}`);
    }
  }
