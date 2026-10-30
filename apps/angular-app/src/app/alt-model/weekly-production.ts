import { Good, IndustrialProductionCapacity, Producer, RuralProductionCapacity, asRuralProduct, throwUndefined } from "./alt-model";

export const weeklyProduction
  : (producer: Producer, good: Good) => number
  = (producer, good) => {
    switch (producer.type) {
      case 'RuralBusiness':
        return RuralProductionCapacity[asRuralProduct(good)][producer.size - 1] ?? throwUndefined();
      case 'Factory': {
        const industry = IndustrialProductionCapacity[producer.industryType];
        const productos = industry.productos as Readonly<Record<Good, Readonly<(number | undefined)[]>>>;
        const amounts = productos[good];
        return amounts ? amounts[producer.size - 1] ?? throwUndefined() : 0;
      }
      case 'City':
        return producer.factories.reduce((total, factory) => { return total + (factory ? weeklyProduction(factory, good) : 0) }, 0);
      default:
        throw new Error(`not implemented: ${producer.type}`);
    }
  }
