import { CirculatingLine, City, OneShotLine, RuralBusiness } from "./alt-model";
import { weeklyTurnOver } from './weekly-turnover';

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
