export const defaultGoods = [
  'Grain', 'Cattle', 'Corn', 'Wood', 'Meat', 'Beer', 'Cotton', 'Sugar', 'Cloth', 'Milk',
  'Vegetables', 'Fruits', 'Clothing', 'Furniture', 'Liquor', 'Dairy Products', 'Coal', 'Iron',
  'Steel', 'Cement', 'Chemicals', 'Tools', 'Canned Foods', 'Oil', 'Petroleum',
] as const;

export type DefaultGood = (typeof defaultGoods)[number];
