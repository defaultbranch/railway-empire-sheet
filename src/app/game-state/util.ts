import { Negocio } from "../game-config/ngrx/negocios.ngrx";
import { NegocioRural } from "./ngrx/negocios-rurales.ngrx";

// 'util.ts' is a collection of loose code snippets; this should be cleaned up eventually

export const ruralWithPerWeek
  : (rural: NegocioRural, negocios: Negocio[]) => NegocioRural & { perWeek: number }
  = (rural, negocios) => {
    const perWeek = (negocios.find(it => it.name === rural.product)?.productos?.find(it => it.name === rural.product)?.perWeek ?? [])[rural.size - 1] ?? 0;
    return { ...rural, perWeek: perWeek }
  };
