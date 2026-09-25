import type { Warehouse } from './game-state/types';
import type { DefaultCityName } from './default-cities';
import type { DefaultGood } from './default-goods';

type DefaultWarehouse = Omit<Warehouse, 'host' | 'goods'> & {
  host: { kind: 'city'; city: DefaultCityName };
  goods: DefaultGood[];
};

export const defaultWarehouses: readonly DefaultWarehouse[] = [
  { name: 'Billings WH B', tracks: 4, host: { kind: 'city', city: 'Billings' }, goods: ['Cattle'] },
] as const;
