import type { ComponentType } from 'react';
import { GoodsPage } from './goods-page';
import { RuralBusinessTypesPage } from './rural-business-types-page';
import { RuralBusinessesPage } from './rural-businesses-page';
import { IndustryTypesPage } from './industry-types-page';
import { IndustriesPage } from './industries-page';
import { DemandsPage } from './demands-page';
import { CitiesPage } from './cities-page';
import { PopulationDemandPage } from './population-demand-page';
import { PopulationDemandInReachPage } from './population-demand-in-reach-page';
import { TotalDemandPage } from './total-demand-page';
import { ProductionPipelinesPage } from './production-pipelines-page';
import { SupplyDemandPage } from './supply-demand-page';
import { StationsWarehousesPage } from './stations-warehouses-page';

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
  {
    title: 'Production Pipelines',
    slug: 'production-pipelines',
    description:
      'Production pipelines derive a relative setup cost for one unit per week of each demanded ' +
      'good, by tracing its production chain back through industries to the rural businesses that ' +
      'supply raw materials. Each row lists the good, its total relative cost, and the businesses ' +
      'and industries involved with the fraction of their level-1 capacity required.',
    Component: ProductionPipelinesPage,
  },
  {
    title: 'Cities',
    slug: 'cities',
    description:
      'A city is a named place with a population. Population drives both the demand for goods and how ' +
      'many industries the city can host. Register cities you discover here as you play.',
    Component: CitiesPage,
  },
  {
    title: 'Population Demand',
    slug: 'population-demand',
    description:
      "Population demand is driven per city, by each city's own population. " +
      "This table lists, per good, the demand of a single selected city and the sum of that demand " +
      'across all registered cities; industry consumption within cities is not considered.',
    Component: PopulationDemandPage,
  },
  {
    title: 'Total Demand',
    slug: 'total-demand',
    description:
      'Total demand extends population demand up each production pipeline: a manufactured good ' +
      "needed by the population induces demand for its industry's raw materials, in proportion to " +
      "the industry's level-1 recipe. This table lists, per good, the resulting demand of a single " +
      'selected city and the sum of that demand across all registered cities.',
    Component: TotalDemandPage,
  },
  {
    title: 'Rural Businesses',
    slug: 'rural-businesses',
    description:
      'A rural business is a concrete, placed instance of a rural business type: its own name, the type ' +
      'it belongs to, and its current level (1 to 5). Register the rural businesses you discover during ' +
      'play here, and update their level as they grow.',
    Component: RuralBusinessesPage,
  },
  {
    title: 'Industries',
    slug: 'industries',
    description:
      'An industry is a concrete, placed instance of an industry type: its own name, the type it belongs ' +
      'to, the city hosting it, which of the city\'s industry slots (1 to 3) it occupies, and its current ' +
      'level (1 to 5). Register the industries you discover during play here, and update their level as ' +
      'they grow.',
    Component: IndustriesPage,
  },
  {
    title: 'Supply vs Demand',
    slug: 'supply-demand',
    description:
      'Supply vs demand opposes total demand against an idealized world supply: raw production from ' +
      "registered rural businesses, plus whatever registered industries can manufacture from what's " +
      "left of their raw materials once each good's own population demand is met, settling goods in " +
      'the order listed on the Goods page. This does not model the game\'s actual logistics or ' +
      'distribution, only a rough ceiling on how much of each good could be available.',
    Component: SupplyDemandPage,
  },
  {
    title: 'Stations & Warehouses',
    slug: 'stations-warehouses',
    description:
      'Train stations and warehouses are the stops a train route runs through. Each is hosted by ' +
      'either a single city or up to two rural businesses, and has a track count (1, 2 or 4 for ' +
      'stations; 2 or 4 for warehouses) that roughly determines its weekly capacity. Register the ' +
      'stations and warehouses you build here; train lines connecting them come next.',
    Component: StationsWarehousesPage,
  },
  {
    title: 'Population Demand in Reach',
    slug: 'population-demand-in-reach',
    description:
      'Population demand in reach compares each good\'s demand across all cities with demand across ' +
      'cities hosted by player-owned stations or warehouses, alongside demand for a selected city.',
    Component: PopulationDemandInReachPage,
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

