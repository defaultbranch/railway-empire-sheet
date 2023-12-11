import { EntityState, createEntityAdapter } from "@ngrx/entity";
import { createFeatureSelector, createReducer, createSelector, on } from "@ngrx/store";

import { Negocio } from "./negocio";
import { NEGOCIOS_FEATURE_KEY, actions } from "./negocios.actions";

const adapter = createEntityAdapter<Negocio>({ selectId: negocio => negocio.name });

export const NEGOCIOS_REDUCER = createReducer(

  adapter.getInitialState(),

  on(actions.addNegocio, (state: EntityState<Negocio>, p: { negocio: Negocio }): EntityState<Negocio> => adapter.addOne(p.negocio, state)),
  on(actions.removeNegocio, (state: EntityState<Negocio>, p: { name: string }): EntityState<Negocio> => adapter.removeOne(p.name, state)),
  on(actions.setNegocios, (state: EntityState<Negocio>, p: { negocios: Negocio[] }): EntityState<Negocio> => adapter.setAll(p.negocios, state)),

  on(actions.setProduct, (state: EntityState<Negocio>, p: { negocio: string, index: number, good: string }): EntityState<Negocio> => adapter.mapOne({
    id: p.negocio,
    map: industria => ({
      ...industria,
      productos: (productos => {
        productos[p.index] = { name: p.good };
        return productos;
      })([...industria.productos ?? []])
    })
  }, state)),

  on(actions.setProductPerWeek, (state: EntityState<Negocio>, p: { negocio: string, index: number, nivel: number, perWeek: number }): EntityState<Negocio> => adapter.mapOne({
    id: p.negocio,
    map: industria => ({
      ...industria,
      productos: (productos => {
        productos[p.index] = (producto => ({
          ...producto,
          perWeek: (perWeek => {
            perWeek[p.nivel - 1] = p.perWeek;
            return perWeek;
          })([...(producto.perWeek ?? [])])
        }))(productos[p.index]);
        return productos;
      })([...industria.productos ?? []])
    })
  }, state)),

);

// selectors

const selectFeature = createFeatureSelector<EntityState<Negocio>>(NEGOCIOS_FEATURE_KEY);

const {
  selectAll,
} = adapter.getSelectors();

export const todosLosNegocios = createSelector(selectFeature, selectAll);
