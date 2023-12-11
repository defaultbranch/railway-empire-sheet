import { createActionGroup, emptyProps, props } from "@ngrx/store";
import { Negocio } from "./negocio";

export const NEGOCIOS_FEATURE_KEY = 'negocios';

export const actions = createActionGroup({
  source: NEGOCIOS_FEATURE_KEY,
  events: {

    addNegocio: props<{ negocio: Negocio }>(),
    removeNegocio: props<{ name: string }>(),
    setNegocios: props<{ negocios: Negocio[] }>(),

    setProduct: props<({ negocio: string, index: number, good: string })>(),
    setProductPerWeek: props<({ negocio: string, index: number, nivel: number, perWeek: number })>(),

    persistNegocios: emptyProps(),
    loadNegocios: emptyProps(),
  }
})

// public actions

export const {
  addNegocio,
  removeNegocio,
  setProduct,
  setProductPerWeek,
  loadNegocios,
} = actions;
