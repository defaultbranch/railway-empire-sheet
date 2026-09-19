import type { ComponentType } from 'react';
import { GoodsPage } from './goods-page';
import { RuralBusinessTypesPage } from './rural-business-types-page';

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
  {
    title: 'Rural Business Types',
    description:
      'A rural business type is a template such as logging or cattle ranching: a name plus a ' +
      'production table of one good, per business level 1 to 5. The table is filled in gradually, ' +
      'as businesses of this type are discovered growing to higher levels.',
    Component: RuralBusinessTypesPage,
  },
];
