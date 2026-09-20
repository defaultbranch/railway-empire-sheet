import { createContext, useContext, useState, type ReactNode } from 'react';
import { getInitialGameState } from './initial-state';

export type Good = string;

export const businessLevels = [1, 2, 3, 4, 5] as const;
export type BusinessLevel = (typeof businessLevels)[number];

export type RuralBusinessType = {
  name: string;
  good: Good;
  // per-level production is only known once a business of this type reaches that level
  productionByLevel: Record<BusinessLevel, number | undefined>;
};

// one raw-material or product entry of an industry type's recipe
export type GoodFlow = {
  good: Good | undefined;
  amountByLevel: Record<BusinessLevel, number | undefined>;
};

export type IndustryFlowField = 'rawMaterials' | 'products';

export type IndustryType = {
  name: string;
  // one or two entries, per the game's recipes
  rawMaterials: GoodFlow[];
  products: GoodFlow[];
};

export type GameState = {
  goods: Good[];
  ruralBusinessTypes: RuralBusinessType[];
  industryTypes: IndustryType[];
};

export type GameStateActions = {
  addGood: (good: Good) => void;
  removeGood: (good: Good) => void;
  addRuralBusinessType: (type: RuralBusinessType) => void;
  removeRuralBusinessType: (name: string) => void;
  setRuralBusinessProduction: (name: string, level: BusinessLevel, amount: number | undefined) => void;
  addIndustryType: (name: string) => void;
  removeIndustryType: (name: string) => void;
  addIndustryFlow: (name: string, field: IndustryFlowField) => void;
  removeIndustryFlow: (name: string, field: IndustryFlowField, index: number) => void;
  setIndustryFlowGood: (name: string, field: IndustryFlowField, index: number, good: Good | undefined) => void;
  setIndustryFlowAmount: (
    name: string,
    field: IndustryFlowField,
    index: number,
    level: BusinessLevel,
    amount: number | undefined,
  ) => void;
};

const GameStateContext = createContext<(GameState & GameStateActions) | undefined>(undefined);

function emptyProductionByLevel(): Record<BusinessLevel, number | undefined> {
  return { 1: undefined, 2: undefined, 3: undefined, 4: undefined, 5: undefined };
}

function emptyGoodFlow(): GoodFlow {
  return { good: undefined, amountByLevel: emptyProductionByLevel() };
}

function updateIndustryFlows(
  types: IndustryType[],
  name: string,
  field: IndustryFlowField,
  updater: (flows: GoodFlow[]) => GoodFlow[],
): IndustryType[] {
  return types.map((type) => (type.name === name ? { ...type, [field]: updater(type[field]) } : type));
}

export function GameStateProvider({ children }: { children: ReactNode }) {
  const [initialState] = useState(getInitialGameState);
  const [goods, setGoods] = useState<Good[]>(initialState.goods);
  const [ruralBusinessTypes, setRuralBusinessTypes] = useState<RuralBusinessType[]>(
    initialState.ruralBusinessTypes,
  );
  const [industryTypes, setIndustryTypes] = useState<IndustryType[]>(initialState.industryTypes);

  const addGood = (good: Good) => {
    setGoods((prev) => (prev.includes(good) ? prev : [...prev, good]));
  };

  const removeGood = (good: Good) => {
    setGoods((prev) => prev.filter((existing) => existing !== good));
  };

  const addRuralBusinessType = (type: RuralBusinessType) => {
    setRuralBusinessTypes((prev) =>
      prev.some((existing) => existing.name === type.name) ? prev : [...prev, type],
    );
  };

  const removeRuralBusinessType = (name: string) => {
    setRuralBusinessTypes((prev) => prev.filter((existing) => existing.name !== name));
  };

  const setRuralBusinessProduction = (name: string, level: BusinessLevel, amount: number | undefined) => {
    setRuralBusinessTypes((prev) =>
      prev.map((existing) =>
        existing.name === name
          ? { ...existing, productionByLevel: { ...existing.productionByLevel, [level]: amount } }
          : existing,
      ),
    );
  };

  const addIndustryType = (name: string) => {
    setIndustryTypes((prev) =>
      prev.some((existing) => existing.name === name)
        ? prev
        : [...prev, { name, rawMaterials: [emptyGoodFlow()], products: [emptyGoodFlow()] }],
    );
  };

  const removeIndustryType = (name: string) => {
    setIndustryTypes((prev) => prev.filter((existing) => existing.name !== name));
  };

  const addIndustryFlow = (name: string, field: IndustryFlowField) => {
    setIndustryTypes((prev) =>
      updateIndustryFlows(prev, name, field, (flows) => (flows.length >= 2 ? flows : [...flows, emptyGoodFlow()])),
    );
  };

  const removeIndustryFlow = (name: string, field: IndustryFlowField, index: number) => {
    setIndustryTypes((prev) =>
      updateIndustryFlows(prev, name, field, (flows) =>
        flows.length <= 1 ? flows : flows.filter((_, i) => i !== index),
      ),
    );
  };

  const setIndustryFlowGood = (name: string, field: IndustryFlowField, index: number, good: Good | undefined) => {
    setIndustryTypes((prev) =>
      updateIndustryFlows(prev, name, field, (flows) =>
        flows.map((flow, i) => (i === index ? { ...flow, good } : flow)),
      ),
    );
  };

  const setIndustryFlowAmount = (
    name: string,
    field: IndustryFlowField,
    index: number,
    level: BusinessLevel,
    amount: number | undefined,
  ) => {
    setIndustryTypes((prev) =>
      updateIndustryFlows(prev, name, field, (flows) =>
        flows.map((flow, i) =>
          i === index ? { ...flow, amountByLevel: { ...flow.amountByLevel, [level]: amount } } : flow,
        ),
      ),
    );
  };

  return (
    <GameStateContext.Provider
      value={{
        goods,
        ruralBusinessTypes,
        industryTypes,
        addGood,
        removeGood,
        addRuralBusinessType,
        removeRuralBusinessType,
        setRuralBusinessProduction,
        addIndustryType,
        removeIndustryType,
        addIndustryFlow,
        removeIndustryFlow,
        setIndustryFlowGood,
        setIndustryFlowAmount,
      }}
    >
      {children}
    </GameStateContext.Provider>
  );
}

export { emptyProductionByLevel };

export function useGameState() {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
}
