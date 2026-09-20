import type { ComponentType } from 'react';
import { GoodsPage } from './goods-page';
import { RuralBusinessTypesPage } from './rural-business-types-page';
import { IndustryTypesPage } from './industry-types-page';
import { DemandsPage } from './demands-page';

export type Page = {
  title: string;
  slug: string;
  description: string;
  Component: ComponentType;
};

export const pages: Page[] = [
  {
    title: 'Goods',
    slug: 'goods',
    description:
      'Goods are the atomic building blocks of the game: named commodities with no fixed role as ' +
      'raw material or product. Register the goods you discover during play here; every other page ' +
      'will refer to goods by name.',
    Component: GoodsPage,
  },
  {
    title: 'Rural Business Types',
    slug: 'rural-business-types',
    description:
      'A rural business type is a template such as logging or cattle ranching: a name plus a ' +
      'production table of one good, per business level 1 to 5. The table is filled in gradually, ' +
      'as businesses of this type are discovered growing to higher levels.',
    Component: RuralBusinessTypesPage,
  },
  {
    title: 'Industry Types',
    slug: 'industry-types',
    description:
      'An industry type is a template such as a meat packing plant or steel mill: a name plus a ' +
      'recipe of one or two raw-material goods consumed and one or two product goods produced, per ' +
      'industry level 1 to 5. As with rural business types, the recipe is filled in gradually, as ' +
      'industries of this type are discovered growing to higher levels.',
    Component: IndustryTypesPage,
  },
  {
    title: 'Demands',
    slug: 'demands',
    description:
      "A demand is a good's population appetite: a minimum city population below which the good " +
      'is not demanded at all, and a demand rate in wagons per week per million citizens applied ' +
      'once that threshold is met. This covers population consumption only, not yet the additional ' +
      'consumption of industries within cities.',
    Component: DemandsPage,
  },
];

// Path shape: /pages/<1-based index>-<slug>, e.g. /pages/1-goods
export function pathForPageIndex(index: number): string {
  return `/pages/${index + 1}-${pages[index].slug}`;
}

export function pageIndexForPath(pathname: string): number {
  const match = /^\/pages\/(\d+)-/.exec(pathname);
  const index = match ? Number(match[1]) - 1 : 0;
  return index >= 0 && index < pages.length ? index : 0;
}

