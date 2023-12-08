import { createActionGroup, emptyProps, props } from "@ngrx/store";

export const INDUSTRIAS_FEATURE_KEY = 'industrias';

export const actions = createActionGroup({
  source: INDUSTRIAS_FEATURE_KEY,
  events: {

    addIndustria: props<({ industria: string })>(),
    removeIndustria: props<({ industria: string })>(),
    setIndustrias: props<{ industrias: string[] }>(),

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
