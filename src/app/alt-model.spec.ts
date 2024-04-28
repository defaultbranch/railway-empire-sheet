import { v4 as uuid } from 'uuid';
import { City, Factory, RuralBusiness, weeklyConsumption, weeklyProduction } from "./alt-model";

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
});
