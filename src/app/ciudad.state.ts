import { EntityState, createEntityAdapter } from "@ngrx/entity";
import { createFeatureSelector, createReducer, createSelector, on } from "@ngrx/store";

import { Ciudad } from "./ciudad";
import { CIUDADES_FEATURE_KEY, actions } from "./ciudad.actions";

const adapter = createEntityAdapter<Ciudad>({ selectId: ciudad => ciudad.name });

export const CIUDAD_REDUCER = createReducer(

  adapter.getInitialState(),

  on(actions.addCiudad, (state: EntityState<Ciudad>, p: { ciudad: Ciudad }): EntityState<Ciudad> => adapter.addOne(p.ciudad, state)),
  on(actions.removeCiudad, (state: EntityState<Ciudad>, p: { nombre: string }): EntityState<Ciudad> => adapter.removeOne(p.nombre, state)),
  on(actions.setCiudades, (state: EntityState<Ciudad>, p: { ciudades: Ciudad[] }): EntityState<Ciudad> => adapter.setAll(p.ciudades, state)),
);

// selectors

const selectFeature = createFeatureSelector<EntityState<Ciudad>>(CIUDADES_FEATURE_KEY);

const {
  selectAll,
} = adapter.getSelectors();

export const todosLosCiudades = createSelector(selectFeature, selectAll);
