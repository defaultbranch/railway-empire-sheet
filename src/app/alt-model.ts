type KeysOfUnion<T> = T extends unknown ? keyof T : never;

const throwUndefined: () => never = () => { throw new Error('undefined'); }
const throwWrongType: () => never = () => { throw new Error('wrong type'); }

type Good = string;
type Size = number;

const RuralProductionCapacity = {
  "Madera": [3.2, 6.4, 12.8, undefined, undefined],
  "Ganado": [2.4, 4.8, 9.6, 16.8, undefined],
  "Cereales": [2.7, 5.5, 11.1, undefined, undefined],
  "Maíz": [1.6, 3.2, 6.4, 11.1, undefined],
  "Algodón": [1.6, 3.2, undefined, undefined, undefined],
  "Azúcar": [1.2, 2.4, 4.8, 8.4, undefined],
  "Leche": [1.6, 3.2, undefined, undefined, undefined],
  "Verduras": [0.8, 1.6, 3.2, undefined, undefined],
  "Fruta": [1.2, 2.4, 4.8, 8.4, undefined],
  "Cemento": [0.8, 1.6, 3.2, undefined, undefined],
  "Carbón": [0.8, 1.6, undefined, undefined, undefined],
  "Hierro": [0.8, 1.6, undefined, undefined, undefined],
  "Aceite": [1.2, undefined, undefined, undefined, undefined],
} as const;

type RuralProduct = keyof typeof RuralProductionCapacity;
function isRuralProduct(good: Good): good is RuralProduct { return RuralProductionCapacity[good as RuralProduct] !== undefined; }
function asRuralProduct(good: Good): RuralProduct { return isRuralProduct(good) ? good : throwWrongType(); }

export type RuralBusiness = {
  type: 'RuralBusiness',
  name: string,
  product: RuralProduct,
  size: Size,
}

const IndustrialProductionCapacity = {
  "Industria cárnica": {
    "materiasPrimas": { "Ganado": [3.6, 7.2, 14.4, undefined, undefined] },
    "productos": { "Carne": [2.4, 4.8, 9.6, undefined, undefined] },
  },
  "Bodegas": {
    "materiasPrimas": { "Cereales": [0.8, 1.6, 3.2, 5.5, undefined] },
    "productos": { "Cerveza": [1.6, 3.2, 6.4, 11.1, undefined] },
  },
  "Sastres": {
    "materiasPrimas": { "Algodón": [1.6, 3.2, undefined, undefined, undefined] },
    "productos": { "Ropa": [1.6, 3.2, undefined, undefined, undefined] },
  },
  "Fábrica de caramelos": {
    "materiasPrimas": {
      "Azúcar": [0.4, undefined, undefined, undefined, undefined],
      "Cereales": [0.4, undefined, undefined, undefined, undefined],
    },
    "productos": { "Caramelos": [0.8, undefined, undefined, undefined, undefined] },
  },
  "Industria del acero": {
    "materiasPrimas": {
      "Carbón": [0.4, 0.8, undefined, undefined, undefined],
      "Hierro": [0.8, 1.6, undefined, undefined, undefined],
    },
    "productos": { "Acero": [0.8, 1.6, undefined, undefined, undefined] },
  },
  "Editoriales": {
    "materiasPrimas": { "Papel": [0.8, undefined, undefined, undefined, undefined] },
    "productos": { "Periódicos": [0.8, undefined, undefined, undefined, undefined] },
  },
  "Fábrica de papel": {
    "materiasPrimas": { "Madera": [0.8, 1.6, 3.2, undefined, undefined] },
    "productos": { "Papel": [1.6, 3.2, 6.4, undefined, undefined] },
  },
  "Industria mobiliaria": {
    "materiasPrimas": { "Madera": [0.8, undefined, undefined, undefined, undefined] },
    "productos": { "Mobiliario": [1.6, undefined, undefined, undefined, undefined] },
  },
  "Fábricas químicas": {
    "materiasPrimas": { "Carbón": [0.4, undefined, undefined, undefined, undefined] },
    "productos": { "Productos químicos": [0.8, undefined, undefined, undefined, undefined] },
  },
  "Indusria juguetera": {
    "materiasPrimas": {
      "Acero": [0.4, undefined, undefined, undefined, undefined],
      "Madera": [0.4, undefined, undefined, undefined, undefined]
    },
    "productos": { "Juguetes": [0.8, undefined, undefined, undefined, undefined] },
  },
  "Refinerías": {
    "materiasPrimas": { "Aceite": [1.2, 2.4, undefined, undefined, undefined] },
    "productos": { "Gasolina": [1.2, 2.4, undefined, undefined, undefined] },
  },
  "Industria automovilística": {
    "materiasPrimas": {
      "Acero": [0.4, undefined, undefined, undefined, undefined],
      "Gasolina": [0.4, undefined, undefined, undefined, undefined]
    },
    "productos": { "Automóviles": [0.8, undefined, undefined, undefined, undefined] },
  }
} as const;

type IndustryType = keyof typeof IndustrialProductionCapacity;
type Industry = typeof IndustrialProductionCapacity[IndustryType];
type IndustrialEduct = KeysOfUnion<typeof IndustrialProductionCapacity[IndustryType]["materiasPrimas"]>;
type IndustrialProduct = KeysOfUnion<typeof IndustrialProductionCapacity[IndustryType]["productos"]>;

export type Factory = {
  type: 'Factory';
  industryType: IndustryType,
  size: Size,
}

const CityPopulationDemand = {
  "Cereales": {
    "wagonsPerMillion": 17.17,
    "minCityPopulation": 0
  },
  "Maíz": {
    "wagonsPerMillion": 14.86,
    "minCityPopulation": 0
  },
  "Cerveza": {
    "wagonsPerMillion": 14.86,
    "minCityPopulation": 0
  },
  "Madera": {
    "wagonsPerMillion": 14.86,
    "minCityPopulation": 0
  },
  "Carne": {
    "wagonsPerMillion": 22.43,
    "minCityPopulation": 0
  },
  "Azúcar": {
    "wagonsPerMillion": 9.45,
    "minCityPopulation": 30000
  },
  "Papel": {
    "wagonsPerMillion": 9.45,
    "minCityPopulation": 35000
  },
  "Leche": {
    "wagonsPerMillion": 9.45,
    "minCityPopulation": 40000
  },
  "Verduras": {
    "wagonsPerMillion": 9.45,
    "minCityPopulation": 45000
  },
  "Fruta": {
    "wagonsPerMillion": 14.46,
    "minCityPopulation": 50000
  },
  "Ropa": {
    "wagonsPerMillion": 19.58,
    "minCityPopulation": 55000
  },
  "Mobiliario": {
    "wagonsPerMillion": 9.45,
    "minCityPopulation": 60000
  },
  "Cemento": {
    "wagonsPerMillion": 9.45,
    "minCityPopulation": 65000
  },
  "Caramelos": {
    "wagonsPerMillion": 9.45,
    "minCityPopulation": 70000
  },
  "Periódicos": {
    "wagonsPerMillion": 9.45,
    "minCityPopulation": 90000
  },
  "Productos químicos": {
    "wagonsPerMillion": 9.45,
    "minCityPopulation": 95000
  },
  "Juguetes": {
    "wagonsPerMillion": 9.45,
    "minCityPopulation": 100000
  },
  "Gasolina": {
    "wagonsPerMillion": 9.45,
    "minCityPopulation": 110000
  },
  "Automóviles": {
    "wagonsPerMillion": 9.45,
    "minCityPopulation": 115000
  },
} as const;

type ConsumerProduct = keyof typeof CityPopulationDemand;
function isConsumerProduct(good: Good): good is ConsumerProduct { return CityPopulationDemand[good as ConsumerProduct] !== undefined; }
function asConsumerProduct(good: Good): ConsumerProduct { return isConsumerProduct(good) ? good : throwWrongType(); }

export type City = {
  type: 'City',
  name: string,
  population: number,
  factories: readonly [Factory | undefined, Factory | undefined, Factory | undefined],
}

type Producer = RuralBusiness | Factory | City | { type?: undefined };

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

type Consumer = Factory | City | { type?: undefined };

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

/**
 * For the middle game, where stations and tracks already exist, and trains running from farm to city are destroyed after delivery.
 */
type OneShotLine = {
  type: 'OneShotLine',
  producer: Readonly<RuralBusiness>,
  productionShare: number,
  consumer: Readonly<City>,
  consumptionShare: number,
  lastRun?: Date,
}

/**
 * For the end game, where station, tracks and trains are permanent.
 */
type CirculatingLine = {
  type: 'CirculatingLine',
  producer: Readonly<Producer>,
  productionShare: number,
  consumer: Readonly<Consumer>,
  consumptionShare: number,
  cycleDays: number,
  trains: number,
}

type Line = OneShotLine | CirculatingLine | { type?: undefined };

const weeklyWagonsProduced
  : (line: Line, good: Good) => number
  = (line, good) => {
    switch (line.type) {
      case 'OneShotLine':
      case 'CirculatingLine':
        return weeklyProduction(line.producer, good) * line.productionShare;
      default:
        throw new Error(`not implemented: ${line.type}`);
    }
  }

const weeklyWagonsConsumed
  : (line: Line, good: Good) => number
  = (line, good) => {
    switch (line.type) {
      case 'OneShotLine':
      case 'CirculatingLine':
        return weeklyConsumption(line.consumer, good) * line.consumptionShare;
      default:
        throw new Error(`not implemented: ${line.type}`);
    }
  }

const weeklyWagonsTurnedOver
  : (line: Line, good: Good) => number
  = (line, good) => Math.min(
    weeklyWagonsProduced(line, good),
    weeklyWagonsConsumed(line, good)
  );

/**
 * For the beginning of the game, where stations and tracks are constructed for the duration of the train run from farm to city.
 */
type OneShotConnection = {
  type: 'ConnectionLine',
  producer: Readonly<RuralBusiness>,
  consumer: Readonly<City>,
  lastRun?: Date,
  miles?: number,
  cost?: number,
}
