import { createActionGroup, emptyProps, props } from "@ngrx/store";
import { NegocioRural } from "./negocio-rural";

export const NEGOCIOS_RURALES_FEATURE_KEY = 'negociosRurales';

export const actions = createActionGroup({
  source: NEGOCIOS_RURALES_FEATURE_KEY,
  events: {

    addNegocioRural: props<{ negocio: NegocioRural }>(),
    removeNegocioRural: props<{ nombre: string }>(),
    setNegociosRurales: props<{ negocios: NegocioRural[] }>(),

    updateNegocioRural: props<{ negocio: NegocioRural, perWeek?: number }>(),

    persistNegociosRurales: emptyProps(),
    loadNegociosRurales: emptyProps(),
  }
})

// public actions

export const {
  addNegocioRural,
  removeNegocioRural,
  updateNegocioRural,
  loadNegociosRurales,
} = actions;
