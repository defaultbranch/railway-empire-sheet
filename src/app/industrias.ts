import { createActionGroup, emptyProps, props } from "@ngrx/store";
import { EntityState, createEntityAdapter } from "@ngrx/entity";
import { createFeatureSelector, createReducer, createSelector, on } from "@ngrx/store";
import { inject } from "@angular/core";
import { map, switchMap, take, tap } from "rxjs";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";

// entity

export type Industria = {
  name: string;
  materiasPrimas?: {
    name: string;
    perWeek?: number[];
  }[];
  productos?: {
    name: string;
    perWeek?: number[];
  }[];
};

// NgRx feature key

export const INDUSTRIAS_FEATURE_KEY = 'industrias';

// NgRx actions

export const actions = createActionGroup({
  source: INDUSTRIAS_FEATURE_KEY,
  events: {

    addIndustria: props<({ industria: Industria })>(),
    removeIndustria: props<({ nombre: string })>(),
    setIndustrias: props<{ industrias: Industria[] }>(),

    setMateriaPrima: props<({ industria: string, index: number, good: string })>(),
    setMateriaPrimaPerWeek: props<({ industria: string, index: number, nivel: number, perWeek: number })>(),
    setProduct: props<({ industria: string, index: number, good: string })>(),
    setProductPerWeek: props<({ industria: string, index: number, nivel: number, perWeek: number })>(),

    persistIndustrias: emptyProps(),
    loadIndustrias: emptyProps(),
  }
});

export const {
  addIndustria,
  removeIndustria,
  setMateriaPrima,
  setMateriaPrimaPerWeek,
  setProduct,
  setProductPerWeek,
  loadIndustrias,
} = actions;

// NgRx entity adapter

const adapter = createEntityAdapter<Industria>({ selectId: industria => industria.name });

// NgRx reducer

export const INDUSTRIAS_REDUCER = createReducer(

  adapter.getInitialState(),

  on(actions.addIndustria, (state: EntityState<Industria>, p: { industria: Industria }): EntityState<Industria> => adapter.addOne(p.industria, state)),
  on(actions.removeIndustria, (state: EntityState<Industria>, p: { nombre: string }): EntityState<Industria> => adapter.removeOne(p.nombre, state)),
  on(actions.setIndustrias, (state: EntityState<Industria>, p: { industrias: Industria[] }): EntityState<Industria> => adapter.setAll(p.industrias, state)),

  on(actions.setMateriaPrima, (state: EntityState<Industria>, p: { industria: string, index: number, good: string }): EntityState<Industria> => adapter.mapOne({
    id: p.industria,
    map: industria => ({
      ...industria,
      materiasPrimas: (materiasPrimas => {
        materiasPrimas[p.index] = { name: p.good };
        return materiasPrimas;
      })([...industria.materiasPrimas ?? []])
    })
  }, state)),

  on(actions.setMateriaPrimaPerWeek, (state: EntityState<Industria>, p: { industria: string, index: number, nivel: number, perWeek: number }): EntityState<Industria> => adapter.mapOne({
    id: p.industria,
    map: industria => ({
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
    id: p.industria,
    map: industria => ({
      ...industria,
      productos: (productos => {
        productos[p.index] = { name: p.good };
        return productos;
      })([...industria.productos ?? []])
    })
  }, state)),

  on(actions.setProductPerWeek, (state: EntityState<Industria>, p: { industria: string, index: number, nivel: number, perWeek: number }): EntityState<Industria> => adapter.mapOne({
    id: p.industria,
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

// NgRx selectors

const selectFeature = createFeatureSelector<EntityState<Industria>>(INDUSTRIAS_FEATURE_KEY);

const {
  selectAll,
} = adapter.getSelectors();

export const allIndustries = createSelector(selectFeature, selectAll);
export const allIndustrieNames = createSelector(allIndustries, industry => industry.map(it => it.name));

// NgRx effects

const industriasChangedEffect = createEffect(
  (
    actions$ = inject(Actions),
  ) => actions$.pipe(
    ofType(
      actions.addIndustria,
      actions.removeIndustria,
      actions.setMateriaPrima,
      actions.setMateriaPrimaPerWeek,
      actions.setProduct,
      actions.setProductPerWeek,
    ),
    map(() => actions.persistIndustrias()),
  ),
  { functional: true }
);

const persistIndustriasEffect = createEffect(
  (
    actions$ = inject(Actions),
    store = inject(Store),
  ) => actions$.pipe(
    ofType(actions.persistIndustrias),
    switchMap(() => store.select(allIndustries).pipe(take(1))),
    tap(industrias => localStorage.setItem('industrias', JSON.stringify(industrias))),
  ),
  { functional: true, dispatch: false }
);

const loadIndustriasEffect = createEffect(
  (actions$ = inject(Actions)) => actions$.pipe(
    ofType(actions.loadIndustrias),
    map(() => actions.setIndustrias({ industrias: JSON.parse(localStorage.getItem('industrias') as string ?? '[]') })),
  ),
  { functional: true }
);

export const industriasEffects = {
  industriasChangedEffect,
  persistIndustriasEffect,
  loadIndustriasEffect,
}
