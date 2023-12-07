import { EntityState, createEntityAdapter } from "@ngrx/entity";
import { createFeatureSelector, createReducer, createSelector, on } from "@ngrx/store";

import { NegocioRural } from "./negocio-rural";
import { NEGOCIOS_RURALES_FEATURE_KEY, actions } from "./negocio-rural.actions";

const adapter = createEntityAdapter<NegocioRural>({ selectId: ciudad => ciudad.name });

export const NEGOCIOS_RURALES_REDUCER = createReducer(

  adapter.getInitialState(),

  on(actions.addNegocioRural, (state: EntityState<NegocioRural>, p: { negocio: NegocioRural }): EntityState<NegocioRural> => adapter.addOne(p.negocio, state)),
  on(actions.removeNegocioRural, (state: EntityState<NegocioRural>, p: { nombre: string }): EntityState<NegocioRural> => adapter.removeOne(p.nombre, state)),
  on(actions.setNegociosRurales, (state: EntityState<NegocioRural>, p: { negocios: NegocioRural[] }): EntityState<NegocioRural> => adapter.setAll(p.negocios, state)),
);

// selectors

const selectFeature = createFeatureSelector<EntityState<NegocioRural>>(NEGOCIOS_RURALES_FEATURE_KEY);

const {
  selectAll,
} = adapter.getSelectors();

export const todosLosNegociosRurales = createSelector(selectFeature, selectAll);
