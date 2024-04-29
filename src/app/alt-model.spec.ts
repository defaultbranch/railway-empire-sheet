import { v4 as uuid } from 'uuid';
import { CirculatingLine, City, Factory, OneShotLine, RuralBusiness, weeklyConsumption, weeklyProduction, weeklyTurnOver } from "./alt-model";

describe('weeklyProduction', () => {

  describe('of Madera farm size 2', () => {
    const farm: RuralBusiness = {
      type: "RuralBusiness",
      name: "test farm",
      product: "Madera",
      size: 2,
    }

    it('is 6.4', () => expect(weeklyProduction(farm, "Madera")).toBeCloseTo(6.4));
  });

  describe('of Sastres', () => {
    const factory: Factory = {
      type: "Factory",
      industryType: "Sastres",
      size: 1,
    }

    it('for Ropa is near 1.6', () => expect(weeklyProduction(factory, "Ropa")).toBeCloseTo(1.6));
    it('for Verduras is zero', () => expect(weeklyProduction(factory, "Verduras")).toBe(0));
  });

  describe('of City with Bodegas', () => {
    const factory: Factory = {
      type: "Factory",
      industryType: "Bodegas",
      size: 1,
    }

    const city: City = {
      type: 'City',
      name: 'test city',
      population: 30_000,
      factories: [factory, undefined, undefined],
    }

    it('for Cerveza is near 1.6', () => expect(weeklyProduction(city, "Cerveza")).toBeCloseTo(1.6));
    it('for Cereales is zero', () => expect(weeklyProduction(city, "Cereales")).toBe(0));
  });

});

describe('weeklyConsumption', () => {

  describe('of Sastres', () => {
    const factory: Factory = {
      type: "Factory",
      industryType: "Sastres",
      size: 1,
    }

    it('for Algodón is near 1.6', () => expect(weeklyConsumption(factory, "Algodón")).toBeCloseTo(1.6));
    it('for Verduras is zero', () => expect(weeklyConsumption(factory, "Verduras")).toBe(0));
  });

  describe('of city of 40k', () => {
    const city: City = {
      type: "City",
      name: "test city 40k",
      population: 40_000,
      factories: [undefined, undefined, undefined],
    }

    it('for Leche is near 0.78', () => expect(weeklyConsumption(city, "Leche")).toBeCloseTo(0.78, 0.01));
    it('for Verduras is zero', () => expect(weeklyConsumption(city, "Verduras")).toBe(0));
  });

  describe('of City with Bodegas', () => {
    const factory: Factory = {
      type: "Factory",
      industryType: "Bodegas",
      size: 1,
    }

    const city: City = {
      type: 'City',
      name: 'test city',
      population: 30_000,
      factories: [factory, undefined, undefined],
    }

    it('for Cereales is near 1.3', () => expect(weeklyConsumption(city, "Cereales")).toBeCloseTo(1.3, 0.05));
    it('for Cerveza is near 0.4', () => expect(weeklyConsumption(city, "Cerveza")).toBeCloseTo(0.4, 0.05));
    it('for Gasolina is zero', () => expect(weeklyConsumption(city, "Gasolina")).toBe(0));
  });
});

describe('weeklyTurnOver', () => {

  describe('from wheat farm size 1', () => {
    const producer: RuralBusiness = {
      type: 'RuralBusiness',
      name: 'test farm',
      size: 1,
      product: 'Cereales',
    }

    describe('to a city pop 120_000', () => {
      const consumer: City = {
        type: 'City',
        name: 'test city',
        population: 120_000,
        factories: [undefined, undefined, undefined],
      }

      describe('of OneShotLine', () => {
        const line: OneShotLine = {
          type: 'OneShotLine',
          producer,
          productionShare: 1.0,
          consumer,
          consumptionShare: 1.0,
        }

        it('for Cereales is near 2.1', () => expect(weeklyTurnOver(line, "Cereales")).toBeCloseTo(2.1, 0.05));
        it('with 0.5 production share for Cereales is near 1.0', () => expect(weeklyTurnOver({ ...line, productionShare: 0.5 } satisfies OneShotLine, "Cereales")).toBeCloseTo(1.0, 0.05));
        it('with 0.5 consumption share for Cereales is near 1.0', () => expect(weeklyTurnOver({ ...line, consumptionShare: 0.5 } satisfies OneShotLine, "Cereales")).toBeCloseTo(1.0, 0.05));
      });

      describe('of CirculatingLine', () => {
        const line: CirculatingLine = {
          type: 'CirculatingLine',
          producer,
          productionShare: 1.0,
          consumer,
          consumptionShare: 1.0,
          cycleDays: 0,
          trains: 0,
        }


        it('of 1 train running 28 days for Cereales is near 2.0', () => expect(weeklyTurnOver({ ...line, trains: 1, cycleDays: 28 } satisfies CirculatingLine, "Cereales")).toBeCloseTo(2.0, 0.05));
        it('of 1 train running 56 days for Cereales is near 1.0', () => expect(weeklyTurnOver({ ...line, trains: 1, cycleDays: 56 } satisfies CirculatingLine, "Cereales")).toBeCloseTo(1.0, 0.05));
        it('of 1 train running 112 days for Cereales is near 0.5', () => expect(weeklyTurnOver({ ...line, trains: 1, cycleDays: 112 } satisfies CirculatingLine, "Cereales")).toBeCloseTo(0.5, 0.05));
        it('of 3 trains running 112 days for Cereales is near 1.5', () => expect(weeklyTurnOver({ ...line, trains: 3, cycleDays: 112 } satisfies CirculatingLine, "Cereales")).toBeCloseTo(1.5, 0.05));
      });
    });
  });
});
