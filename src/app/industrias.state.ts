import { EntityState, createEntityAdapter } from "@ngrx/entity";
import { createFeatureSelector, createReducer, createSelector, on } from "@ngrx/store";

import { INDUSTRIAS_FEATURE_KEY, actions } from "./industrias.actions";

const adapter = createEntityAdapter<string>({ selectId: good => good });

export const INDUSTRIAS_REDUCER = createReducer(

  adapter.getInitialState(),

  on(actions.addIndustria, (state: EntityState<string>, p: { industria: string }): EntityState<string> => adapter.addOne(p.industria, state)),
  on(actions.removeIndustria, (state: EntityState<string>, p: { industria: string }): EntityState<string> => adapter.removeOne(p.industria, state)),
  on(actions.setIndustrias, (state: EntityState<string>, p: { industrias: string[] }): EntityState<string> => adapter.setAll(p.industrias, state)),
);

// selectors

const selectFeature = createFeatureSelector<EntityState<string>>(INDUSTRIAS_FEATURE_KEY);

const {
  selectAll,
} = adapter.getSelectors();

export const allIndustries = createSelector(selectFeature, selectAll);
