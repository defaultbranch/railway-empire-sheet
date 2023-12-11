import { EntityState, createEntityAdapter } from "@ngrx/entity";
import { createFeatureSelector, createReducer, createSelector, on } from "@ngrx/store";

import { Negocio } from "./negocio";
import { NEGOCIOS_FEATURE_KEY, actions } from "./negocios.actions";

const adapter = createEntityAdapter<Negocio>({ selectId: negocio => negocio.name });

export const NEGOCIOS_REDUCER = createReducer(

  adapter.getInitialState(),

  on(actions.addNegocio, (state: EntityState<Negocio>, p: { negocio: Negocio }): EntityState<Negocio> => adapter.addOne(p.negocio, state)),
  on(actions.removeNegocio, (state: EntityState<Negocio>, p: { nombre: string }): EntityState<Negocio> => adapter.removeOne(p.nombre, state)),
  on(actions.setNegocios, (state: EntityState<Negocio>, p: { negocios: Negocio[] }): EntityState<Negocio> => adapter.setAll(p.negocios, state)),
);

// selectors

const selectFeature = createFeatureSelector<EntityState<Negocio>>(NEGOCIOS_FEATURE_KEY);

const {
  selectAll,
} = adapter.getSelectors();

export const todosLosNegocios = createSelector(selectFeature, selectAll);
