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
    setProduct: props<({ industria: string, index: number, good: string })>(),

    persistIndustrias: emptyProps(),
    loadIndustrias: emptyProps(),
  }
})

// public actions

export const {
  addIndustria,
  removeIndustria,
  setMateriaPrima,
  setProduct,
  loadIndustrias,
} = actions;
