import { Demand } from "../game-config/ngrx/demands.ngrx";
import { Industria } from "../game-config/ngrx/industrias.ngrx";
import { Negocio } from "../game-config/ngrx/negocios.ngrx";
import { Ciudad } from "./ngrx/ciudades.ngrx";
import { NegocioRural } from "./ngrx/negocios-rurales.ngrx";
import { ProviderConnection } from "./ngrx/provider-connections.ngrx";

// 'util.ts' is a collection of loose code snippets; this should be cleaned up eventually

export const ruralWithProductionPerWeek
  : (rural: NegocioRural, negocios: Negocio[]) => NegocioRural & { perWeek: number }
  = (rural, negocios) => ({ ...rural, perWeek: ruralProductionPerWeek(rural, negocios) });

export const ruralProductionPerWeek
  : (rural: NegocioRural, negocios: Negocio[]) => number
  = (rural, negocios) => (negocios.find(it => it.name === rural.product)?.productos?.find(it => it.name === rural.product)?.perWeek ?? [])[rural.size - 1] ?? 0;

export const businessDemandPerWeek
  : (provider: ProviderConnection, ciudad: Ciudad, industries: Industria[]) => number
  = (provider, ciudad, industries) => ciudad.businesses.reduce((total, business) => {
    if (!business) return total;
    const industrie = industries.find(it => it.name === business.name);
    const perWeek = (industrie?.materiasPrimas?.find(it => it.name === provider.good)?.perWeek ?? [])[business.size - 1] ?? 0;
    return total + perWeek;
  }, 0);

export const citizenDemandPerWeek
  : (provider: ProviderConnection, ciudad: Ciudad, demands: Demand[]) => number
  = (provider, ciudad, demands) => {
    const demand = demands.find(it => it.good === provider.good);
    if (!demand) return 0;
    if (ciudad.population < demand.minCitySize) return 0;
    return ciudad.population * (demand.wagonsPerMillion ?? 0) / 1e6;
  };

export const nextRun
  : (lastRun: Date, effectiveRate: number) => Date
  = (lastRun, effectiveRate) => {
    const nextRun = new Date(lastRun);
    nextRun.setDate(nextRun.getDate() + 56 / effectiveRate);
    return nextRun;
}
