import { RuralBusiness, weeklyProduction } from "./alt-model";

describe('weeklyProuction', () => {

    describe('of Madera farm size 2', () => {
        const farm: RuralBusiness = {
            type: "Farm",
            name: "test farm",
            product: "Madera",
            size: 2
        }

        it('is 6.4', () => expect(weeklyProduction(farm, "Madera")).toBeCloseTo(6.4));
    });
});
