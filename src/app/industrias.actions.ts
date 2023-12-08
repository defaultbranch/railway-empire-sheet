import { createActionGroup, emptyProps, props } from "@ngrx/store";
import { Industria } from "./industria";

export const INDUSTRIAS_FEATURE_KEY = 'industrias';

export const actions = createActionGroup({
  source: INDUSTRIAS_FEATURE_KEY,
  events: {

    addIndustria: props<({ industria: Industria })>(),
    removeIndustria: props<({ nombre: string })>(),
    setIndustrias: props<{ industrias: Industria[] }>(),

    persistIndustrias: emptyProps(),
    loadIndustrias: emptyProps(),
  }
})

// public actions

export const {
  addIndustria,
  removeIndustria,
  loadIndustrias,
} = actions;
