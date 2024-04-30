import { City, Factory } from "./alt-model";
import { weeklyConsumption } from "./weekly-consumption";

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
