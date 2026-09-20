import { createContext, useContext, useState, type ReactNode } from 'react';
import { emptyGoodFlow, type BusinessLevel, type Good, type GoodFlow, type IndustryFlowField, type IndustryType } from './types';

export type IndustryState = {
  industryTypes: IndustryType[];
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

const IndustryContext = createContext<IndustryState | undefined>(undefined);

function updateIndustryFlows(
  types: IndustryType[],
  name: string,
  field: IndustryFlowField,
  updater: (flows: GoodFlow[]) => GoodFlow[],
): IndustryType[] {
  return types.map((type) => (type.name === name ? { ...type, [field]: updater(type[field]) } : type));
}

export function IndustryProvider({
  initialTypes,
  children,
}: {
  initialTypes: IndustryType[];
  children: ReactNode;
}) {
  const [industryTypes, setIndustryTypes] = useState<IndustryType[]>(initialTypes);

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
    <IndustryContext.Provider
      value={{
        industryTypes,
        addIndustryType,
        removeIndustryType,
        addIndustryFlow,
        removeIndustryFlow,
        setIndustryFlowGood,
        setIndustryFlowAmount,
      }}
    >
      {children}
    </IndustryContext.Provider>
  );
}

export function useIndustryTypes() {
  const context = useContext(IndustryContext);
  if (context === undefined) {
    throw new Error('useIndustryTypes must be used within an IndustryProvider');
  }
  return context;
}
