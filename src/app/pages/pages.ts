import type { ComponentType } from 'react';
import { GoodsPage } from './goods-page';

export type Page = {
  title: string;
  description: string;
  Component: ComponentType;
};

export const pages: Page[] = [
  {
    title: 'Goods',
    description:
      'Goods are the atomic building blocks of the game: named commodities with no fixed role as ' +
      'raw material or product. Register the goods you discover during play here; every other page ' +
      'will refer to goods by name.',
    Component: GoodsPage,
  },
];
