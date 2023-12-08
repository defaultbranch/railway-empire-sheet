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

  on(actions.setMateriaPrima, (state: EntityState<Industria>, p: { industria: string, index: number, good: string }): EntityState<Industria> => adapter.mapOne({
    id: p.industria, map: industria => ({
      ...industria,
      materiasPrimas: (materiasPrimas => {
        materiasPrimas[p.index] = { name: p.good };
        return materiasPrimas;
      })([...industria.materiasPrimas ?? []])
    })
  }, state)),

  on(actions.setMateriaPrimaPerWeek, (state: EntityState<Industria>, p: { industria: string, index: number, nivel: number, perWeek: number }): EntityState<Industria> => adapter.mapOne({
    id: p.industria, map: industria => ({
      ...industria,
      materiasPrimas: (materiasPrimas => {
        materiasPrimas[p.index] = (materiaPrima => ({
          ...materiaPrima,
          perWeek: (perWeek => {
            perWeek[p.nivel - 1] = p.perWeek;
            return perWeek;
          })([...(materiaPrima.perWeek ?? [])])
        }))(materiasPrimas[p.index]);
        return materiasPrimas;
      })([...industria.materiasPrimas ?? []])
    })
  }, state)),

  on(actions.setProduct, (state: EntityState<Industria>, p: { industria: string, index: number, good: string }): EntityState<Industria> => adapter.mapOne({
    id: p.industria, map: industria => ({
      ...industria,
      productos: (productos => {
        productos[p.index] = { name: p.good };
        return productos;
      })([...industria.productos ?? []])
    })
  }, state)),

  on(actions.setProductPerWeek, (state: EntityState<Industria>, p: { industria: string, index: number, nivel: number, perWeek: number }): EntityState<Industria> => adapter.mapOne({
    id: p.industria, map: industria => ({
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

const selectFeature = createFeatureSelector<EntityState<Industria>>(INDUSTRIAS_FEATURE_KEY);

const {
  selectAll,
} = adapter.getSelectors();

export const allIndustries = createSelector(selectFeature, selectAll);
export const allIndustrieNames = createSelector(allIndustries, industry => industry.map(it => it.name));
