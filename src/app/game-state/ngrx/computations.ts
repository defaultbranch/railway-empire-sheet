import { Store, createSelector } from "@ngrx/store";

import { Good } from '../../game-config/ngrx/goods.ngrx';
import { negocioRuralByNameAndProduct } from './negocios-rurales.ngrx';
import { negocioProductionPerWeek } from '../../game-config/ngrx/negocios.ngrx';
import { ProviderConnection } from "./provider-connections.ngrx";
import { ciudad } from "./ciudades.ngrx";
import { allIndustries } from "../../game-config/ngrx/industrias.ngrx";
import { allDemands } from "../../game-config/ngrx/demands.ngrx";
import { gameDateAsDate } from "./game-date.ngrx";

export const productionPerWeek = (
  producerName: string,
  good: Good
) => createSelector(
  negocioRuralByNameAndProduct(producerName, good),
  negocioProductionPerWeek(good, good),
  (rural, perWeek) => rural ? perWeek ? perWeek[rural.size - 1] : 0 : 0
);

export const businessDemandPerWeek = (
  city: string,
  good: Good,
) => createSelector(
  ciudad(city),
  allIndustries,
  (ciudad, industries) => ciudad?.businesses.reduce((total, business) => {
    if (!business) return total;
    const industrie = industries.find(it => it.name === business.name);
    const perWeek = (industrie?.materiasPrimas?.find(it => it.name === good)?.perWeek ?? [])[business.size - 1] ?? 0;
    return total + perWeek;
  }, 0) ?? 0
);

export const citizenDemandPerWeek = (
  city: string,
  good: Good,
) => createSelector(
  allDemands,
  ciudad(city),
  (demands, ciudad) => {
    if (!ciudad) return 0;
    const demand = demands.find(it => it.good === good);
    if (!demand) return 0;
    if (ciudad.population < demand.minCitySize) return 0;
    return ciudad.population * (demand.wagonsPerMillion ?? 0) / 1e6;
  }
);

export const cityDemandPerWeek = (
  city: string,
  good: Good,
) => createSelector(
  businessDemandPerWeek(city, good),
  citizenDemandPerWeek(city, good),
  (a, b) => a + b
);

export const providerDemandPerWeek = (
  provider: ProviderConnection,
) => cityDemandPerWeek(provider.destinationCity, provider.good);

export const providerEffectiveRate = (
  provider: ProviderConnection,
) => createSelector(
  productionPerWeek(provider.ruralProducer, provider.good),
  cityDemandPerWeek(provider.destinationCity, provider.good),
  (productionPerWeek, demandPerWeek) => Math.min(productionPerWeek * (provider.productionFactor ?? 1.0), demandPerWeek * (provider.demandFactor ?? 1.0))
)

export const nextRun = (
  provider: ProviderConnection,
) => createSelector(
  providerEffectiveRate(provider),
  (effectiveRate) => {
    if (effectiveRate <= 0) return undefined;
    if (!provider.lastRun) return undefined;
    const nextRun = new Date(provider.lastRun);
    nextRun.setDate(nextRun.getDate() + 56 / effectiveRate);
    return nextRun;
  }
)

export const runningLate = (
  provider: ProviderConnection
) => createSelector(
    gameDateAsDate,
    nextRun(provider),
    (gameDate, nextRun) => gameDate ? nextRun ? nextRun.getTime() <= gameDate.getTime() : false : false
)
