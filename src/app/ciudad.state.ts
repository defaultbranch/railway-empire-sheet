import { EntityState, createEntityAdapter } from "@ngrx/entity";
import { createFeatureSelector, createReducer, createSelector, on } from "@ngrx/store";

import { Ciudad } from "./ciudad";
import { CIUDADES_FEATURE_KEY, actions } from "./ciudad.actions";

export const ciudadAdapter = createEntityAdapter<Ciudad>({ selectId: ciudad => ciudad.name });

export const CIUDAD_REDUCER = createReducer(

  ciudadAdapter.getInitialState(),

  on(actions.addCiudad, (state: EntityState<Ciudad>, p: { ciudad: Ciudad }): EntityState<Ciudad> => ciudadAdapter.addOne(p.ciudad, state)),
  on(actions.removeCiudad, (state: EntityState<Ciudad>, p: { nombre: string }): EntityState<Ciudad> => ciudadAdapter.removeOne(p.nombre, state)),
);

// selectors

const selectCiudadFeature = createFeatureSelector<EntityState<Ciudad>>(CIUDADES_FEATURE_KEY);

const {
  selectAll,
} = ciudadAdapter.getSelectors();

export const todosLosCiudades = createSelector(selectCiudadFeature, selectAll);
