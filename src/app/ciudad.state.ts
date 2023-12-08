import { EntityState, createEntityAdapter } from "@ngrx/entity";
import { createFeatureSelector, createReducer, createSelector, on } from "@ngrx/store";

import { Ciudad } from "./ciudad";
import { CIUDADES_FEATURE_KEY, actions } from "./ciudad.actions";
import { act } from "@ngrx/effects";

const adapter = createEntityAdapter<Ciudad>({ selectId: ciudad => ciudad.name });

export const CIUDAD_REDUCER = createReducer(

  adapter.getInitialState(),

  on(actions.addCiudad, (state: EntityState<Ciudad>, p: { ciudad: Ciudad }): EntityState<Ciudad> => adapter.addOne(p.ciudad, state)),
  on(actions.removeCiudad, (state: EntityState<Ciudad>, p: { nombre: string }): EntityState<Ciudad> => adapter.removeOne(p.nombre, state)),
  on(actions.setCiudades, (state: EntityState<Ciudad>, p: { ciudades: Ciudad[] }): EntityState<Ciudad> => adapter.setAll(p.ciudades, state)),

  on(actions.updatePopulation, (state: EntityState<Ciudad>, p: { name: string, population: number }): EntityState<Ciudad> => adapter.mapOne({ id: p.name, map: ciudad => ({ ...ciudad, population: p.population }) }, state)),
  on(actions.updateBusiness, (state: EntityState<Ciudad>, p: { name: string, index: number, business: string, size: number }): EntityState<Ciudad> => adapter.mapOne({
    id: p.name, map: ciudad => ({
      ...ciudad,
      businesses: (businesses => {
        businesses[p.index] = { business: p.business, size: p.size };
        return businesses;
      })([...ciudad.businesses ?? []])
    })
  }, state)),
);

// selectors

const selectFeature = createFeatureSelector<EntityState<Ciudad>>(CIUDADES_FEATURE_KEY);

const {
  selectAll,
} = adapter.getSelectors();

export const todosLosCiudades = createSelector(selectFeature, selectAll);
