import { createActionGroup, emptyProps, props } from "@ngrx/store";
import { Negocio } from "./negocio";

export const NEGOCIOS_FEATURE_KEY = 'negocios';

export const actions = createActionGroup({
  source: NEGOCIOS_FEATURE_KEY,
  events: {

    addNegocio: props<{ negocio: Negocio }>(),
    removeNegocio: props<{ nombre: string }>(),
    setNegocios: props<{ negocios: Negocio[] }>(),

    persistNegocios: emptyProps(),
    loadNegocios: emptyProps(),
  }
})

// public actions

export const {
  addNegocio,
  removeNegocio,
  loadNegocios,
} = actions;
