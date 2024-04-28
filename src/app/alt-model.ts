

type Good = string;

type Producer = unknown;

type Consumer = unknown;

type Line = {
    type: 'Line',
    producer: Producer,
    productionShare: number,
    consumer: Consumer,
    consumptionShare: number,
}

const weeklyProduction
    : (producer: Producer, good: Good) => number
    = () => { throw new Error("not implemented"); }

const weeklyConsumption
    : (consumer: Consumer, good: Good) => number
    = () => { throw new Error("not implemented"); }

const weeklyWagonsProduced
    : (line: Line, good: Good) => number
    = (line, good) => weeklyProduction(line.producer, good) * line.productionShare;

const weeklyWagonsConsumed
    : (line: Line, good: Good) => number
    = (line, good) => weeklyConsumption(line.consumer, good) * line.consumptionShare;


const weeklyWagonsTurnedOver
    : (line: Line, good: Good) => number
    = (line, good) => Math.min(
        weeklyWagonsProduced(line, good),
        weeklyWagonsConsumed(line, good)
    );
