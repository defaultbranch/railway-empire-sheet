import { Demand } from "../game-config/ngrx/demands.ngrx";
import { Industria } from "../game-config/ngrx/industrias.ngrx";
import { Negocio } from "../game-config/ngrx/negocios.ngrx";
import { Business, Ciudad } from "./ngrx/ciudades.ngrx";
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
  : (provider: ProviderConnection, businesses: [Business?, Business?, Business?], industries: Industria[]) => number
  = (provider, businesses, industries) => businesses.reduce((total, business) => {
    if (!business) throw Error('no business');
    const industrie = industries.find(it => it.name === business.business);
    const perWeek = (industrie?.materiasPrimas?.find(it => it.name === provider.good)?.perWeek ?? [])[business.size - 1] ?? 0;
    return total + perWeek;
  }, 0);

export const citizenDemandPerWeek
  : (provider: ProviderConnection, ciudad: Ciudad, demands: Demand[]) => number
  = (provider, ciudad, demands) => ciudad.population * (demands.find(it => it.good === provider.good)?.wagonsPerMillion ?? 0) / 1e6;
