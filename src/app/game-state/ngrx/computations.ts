import { createSelector } from "@ngrx/store";

import { Good } from '../../game-config/ngrx/goods.ngrx';
import { negocioRuralByNameAndProduct } from './negocios-rurales.ngrx';
import { negocioProductionPerWeek } from '../../game-config/ngrx/negocios.ngrx';
import { ProviderConnection } from "./provider-connections.ngrx";
import { Ciudad } from "./ciudades.ngrx";
import { Industria } from "../../game-config/ngrx/industrias.ngrx";
import { Demand } from "../../game-config/ngrx/demands.ngrx";

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
  ciudad: Ciudad,
  industries: Industria[]
) => createSelector(
  () => ciudad.businesses.reduce((total, business) => {
    if (!business) return total;
    const industrie = industries.find(it => it.name === business.name);
    const perWeek = (industrie?.materiasPrimas?.find(it => it.name === provider.good)?.perWeek ?? [])[business.size - 1] ?? 0;
    return total + perWeek;
  }, 0)
);

export const citizenDemandPerWeek = (
  provider: ProviderConnection,
  ciudad: Ciudad,
  demands: Demand[]
) => createSelector(
  () => {
    const demand = demands.find(it => it.good === provider.good);
    if (!demand) return 0;
    if (ciudad.population < demand.minCitySize) return 0;
    return ciudad.population * (demand.wagonsPerMillion ?? 0) / 1e6;
  }
);

export const demandPerWeek = (
  provider: ProviderConnection,
  ciudad: Ciudad,
  demands: Demand[],
  industries: Industria[]
) => createSelector(
  businessDemandPerWeek(provider, ciudad, industries),
  citizenDemandPerWeek(provider, ciudad, demands),
  (a, b) => a + b
);

export const effectiveRate = (
  provider: ProviderConnection,
  ciudad: Ciudad,
  demands: Demand[],
  industries: Industria[]
) => createSelector(
  productionPerWeek(provider.ruralProducer, provider.good),
  demandPerWeek(provider, ciudad, demands, industries),
  (productionPerWeek, demandPerWeek) => Math.min(productionPerWeek * (provider.productionFactor ?? 1.0), demandPerWeek * (provider.demandFactor ?? 1.0))
)

export const nextRun = (
  lastRun: Date,
  provider: ProviderConnection,
  ciudad: Ciudad,
  demands: Demand[],
  industries: Industria[]
) => createSelector(
  effectiveRate(provider, ciudad, demands, industries),
  (effectiveRate) => {
    const nextRun = new Date(lastRun);
    nextRun.setDate(nextRun.getDate() + 56 / effectiveRate);
    return nextRun;
  }
)
