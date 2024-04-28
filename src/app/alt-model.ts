
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

type Producer = RuralBusiness;

export const weeklyProduction
    : (producer: Producer, good: Good) => number
    = (producer, good) => {
        switch (producer.type) {
            case 'RuralBusiness': return RuralProductionCapacity[asRuralProduct(good)][producer.size - 1] ?? throwUndefined();
            default: throw new Error(`not implemented: ${producer.type}`);
        }
    }

type Consumer = unknown;

type LineX = {
    type: 'LineX',
    producer: Producer,
    productionShare: number,
    consumer: Consumer,
    consumptionShare: number,
}

type Line = LineX;

const weeklyConsumption
    : (consumer: Consumer, good: Good) => number
    = () => { throw new Error("not implemented"); }

const weeklyWagonsProduced
    : (line: Line, good: Good) => number
    = (line, good) => {
        switch (line.type) {
            case 'LineX': return weeklyProduction(line.producer, good) * line.productionShare;
            default: throw new Error(`not implemented: ${line.type}`);
        }
    }

const weeklyWagonsConsumed
    : (line: Line, good: Good) => number
    = (line, good) => {
        switch (line.type) {
            case 'LineX': return weeklyConsumption(line.consumer, good) * line.consumptionShare;
            default: throw new Error(`not implemented: ${line.type}`);
        }
    }

const weeklyWagonsTurnedOver
    : (line: Line, good: Good) => number
    = (line, good) => Math.min(
        weeklyWagonsProduced(line, good),
        weeklyWagonsConsumed(line, good)
    );
