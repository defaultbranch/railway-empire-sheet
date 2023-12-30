import { createSelector } from "@ngrx/store";

import { Good } from '../../game-config/ngrx/goods.ngrx';
import { negocioRuralByNameAndProduct } from './negocios-rurales.ngrx';
import { negocioProductionPerWeek } from '../../game-config/ngrx/negocios.ngrx';
import { ProviderConnection } from "./provider-connections.ngrx";
import { ciudad } from "./ciudades.ngrx";
import { allIndustries } from "../../game-config/ngrx/industrias.ngrx";
import { allDemands } from "../../game-config/ngrx/demands.ngrx";

export const productionPerWeek = (
  producerName: string,
  good: Good
) => createSelector(
  negocioRuralByNameAndProduct(producerName, good),
  negocioProductionPerWeek(good, good),
  (rural, perWeek) => rural ? perWeek ? perWeek[rural.size - 1] : 0 : 0
);

export const businessDemandPerWeek = (
  provider: ProviderConnection,
) => createSelector(
  ciudad(provider.destinationCity),
  allIndustries,
  (ciudad, industries) => ciudad?.businesses.reduce((total, business) => {
    if (!business) return total;
    const industrie = industries.find(it => it.name === business.name);
    const perWeek = (industrie?.materiasPrimas?.find(it => it.name === provider.good)?.perWeek ?? [])[business.size - 1] ?? 0;
    return total + perWeek;
  }, 0) ?? 0
);

export const citizenDemandPerWeek = (
  provider: ProviderConnection,
) => createSelector(
  allDemands,
  ciudad(provider.destinationCity),
  (demands, ciudad) => {
    if (!ciudad) return 0;
    const demand = demands.find(it => it.good === provider.good);
    if (!demand) return 0;
    if (ciudad.population < demand.minCitySize) return 0;
    return ciudad.population * (demand.wagonsPerMillion ?? 0) / 1e6;
  }
);

export const demandPerWeek = (
  provider: ProviderConnection,
) => createSelector(
  businessDemandPerWeek(provider),
  citizenDemandPerWeek(provider),
  (a, b) => a + b
);

export const effectiveRate = (
  provider: ProviderConnection,
) => createSelector(
  productionPerWeek(provider.ruralProducer, provider.good),
  demandPerWeek(provider),
  (productionPerWeek, demandPerWeek) => Math.min(productionPerWeek * (provider.productionFactor ?? 1.0), demandPerWeek * (provider.demandFactor ?? 1.0))
)

export const nextRun = (
  provider: ProviderConnection,
) => createSelector(
  effectiveRate(provider),
  (effectiveRate) => {
    if (effectiveRate <= 0) return undefined;
    if (!provider.lastRun) return undefined;
    const nextRun = new Date(provider.lastRun);
    nextRun.setDate(nextRun.getDate() + 56 / effectiveRate);
    return nextRun;
  }
)
