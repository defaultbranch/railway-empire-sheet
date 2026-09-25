import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Warehouse } from './types';

export type WarehousesState = {
  warehouses: Warehouse[];
  addWarehouse: (warehouse: Warehouse) => void;
  removeWarehouse: (name: string) => void;
};

const WarehousesContext = createContext<WarehousesState | undefined>(undefined);

export function WarehousesProvider({
  initialWarehouses,
  children,
}: {
  initialWarehouses: Warehouse[];
  children: ReactNode;
}) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>(initialWarehouses);

  const addWarehouse = (warehouse: Warehouse) => {
    setWarehouses((prev) =>
      prev.some((existing) => existing.name === warehouse.name) ? prev : [...prev, warehouse],
    );
  };

  const removeWarehouse = (name: string) => {
    setWarehouses((prev) => prev.filter((existing) => existing.name !== name));
  };

  return (
    <WarehousesContext.Provider value={{ warehouses, addWarehouse, removeWarehouse }}>
      {children}
    </WarehousesContext.Provider>
  );
}

export function useWarehouses() {
  const context = useContext(WarehousesContext);
  if (context === undefined) {
    throw new Error('useWarehouses must be used within a WarehousesProvider');
  }
  return context;
}
