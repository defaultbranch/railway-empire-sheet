import { EntityState, createEntityAdapter } from "@ngrx/entity";
import { createFeatureSelector, createReducer, createSelector, on } from "@ngrx/store";

import { INDUSTRIAS_FEATURE_KEY, actions } from "./industrias.actions";
import { Industria } from "./industria";

const adapter = createEntityAdapter<Industria>({ selectId: industria => industria.name });

export const INDUSTRIAS_REDUCER = createReducer(

  adapter.getInitialState(),

  on(actions.addIndustria, (state: EntityState<Industria>, p: { industria: Industria }): EntityState<Industria> => adapter.addOne(p.industria, state)),
  on(actions.removeIndustria, (state: EntityState<Industria>, p: { nombre: string }): EntityState<Industria> => adapter.removeOne(p.nombre, state)),
  on(actions.setIndustrias, (state: EntityState<Industria>, p: { industrias: Industria[] }): EntityState<Industria> => adapter.setAll(p.industrias, state)),
);

// selectors

const selectFeature = createFeatureSelector<EntityState<Industria>>(INDUSTRIAS_FEATURE_KEY);

const {
  selectAll,
} = adapter.getSelectors();

export const allIndustries = createSelector(selectFeature, selectAll);
export const allIndustrieNames = createSelector(allIndustries, industry => industry.map(it => it.name));
