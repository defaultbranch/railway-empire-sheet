import { createActionGroup, emptyProps, props } from "@ngrx/store";
import { Industria } from "./industria";

export const INDUSTRIAS_FEATURE_KEY = 'industrias';

export const actions = createActionGroup({
  source: INDUSTRIAS_FEATURE_KEY,
  events: {

    addIndustria: props<({ industria: Industria })>(),
    removeIndustria: props<({ nombre: string })>(),
    setIndustrias: props<{ industrias: Industria[] }>(),

    setMateriaPrima: props<({ industria: string, index: number, good: string })>(),
    setMateriaPrimaPerWeek: props<({ industria: string, index: number, nivel: number, perWeek: number })>(),
    setProduct: props<({ industria: string, index: number, good: string })>(),
    setProductPerWeek: props<({ industria: string, index: number, nivel: number, perWeek: number })>(),

    persistIndustrias: emptyProps(),
    loadIndustrias: emptyProps(),
  }
})

// public actions

export const {
  addIndustria,
  removeIndustria,
  setMateriaPrima,
  setMateriaPrimaPerWeek,
  setProduct,
  setProductPerWeek,
  loadIndustrias,
} = actions;
