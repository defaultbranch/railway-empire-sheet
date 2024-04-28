import { City, RuralBusiness, weeklyConsumption, weeklyProduction } from "./alt-model";

describe('weeklyProuction', () => {

    describe('of Madera farm size 2', () => {
        const farm: RuralBusiness = {
            type: "RuralBusiness",
            name: "test farm",
            product: "Madera",
            size: 2,
        }

        it('is 6.4', () => expect(weeklyProduction(farm, "Madera")).toBeCloseTo(6.4));
    });
});

describe('weeklyConsumption', () => {

    describe('of city of 40k', () => {
        const city: City = {
            type: "City",
            name: "test city 40k",
            population: 40_000,
        }

        it('for Leche is', () => expect(weeklyConsumption(city, "Leche")).toBeCloseTo(0.78, 0.01));
        it('for Verduras is', () => expect(weeklyConsumption(city, "Verduras")).toBeCloseTo(0));
    });
});
