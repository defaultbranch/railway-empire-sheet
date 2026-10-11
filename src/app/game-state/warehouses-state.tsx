import { createContext, useContext, useState, type ReactNode } from 'react';
import { warehouseGoodSlotsByTracks, type Good, type Warehouse } from './types';

export type WarehousesState = {
  warehouses: Warehouse[];
  addWarehouse: (warehouse: Warehouse) => void;
  setWarehouseGoods: (name: string, goods: Good[]) => void;
  removeWarehouse: (name: string) => void;
  replaceWarehouses: (warehouses: Warehouse[]) => void;
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

  const setWarehouseGoods = (name: string, goods: Good[]) => {
    setWarehouses((prev) =>
      prev.map((warehouse) =>
        warehouse.name !== name
          ? warehouse
          : {
              ...warehouse,
              goods: [...new Set(goods)].slice(0, warehouseGoodSlotsByTracks[warehouse.tracks]),
            },
      ),
    );
  };

  const removeWarehouse = (name: string) => {
    setWarehouses((prev) => prev.filter((existing) => existing.name !== name));
  };

  const replaceWarehouses = (warehouses: Warehouse[]) => {
    setWarehouses(warehouses);
  };

  return (
    <WarehousesContext.Provider value={{ warehouses, addWarehouse, setWarehouseGoods, removeWarehouse, replaceWarehouses }}>
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
