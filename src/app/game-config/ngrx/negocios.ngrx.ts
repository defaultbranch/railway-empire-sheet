import { NgModule, inject } from "@angular/core";
import { map, switchMap, take, tap } from "rxjs";
import { Store, StoreModule, createActionGroup, createFeatureSelector, createReducer, createSelector, emptyProps, on, props } from "@ngrx/store";
import { EntityState, createEntityAdapter } from "@ngrx/entity";
import { Actions, EffectsModule, createEffect, ofType } from "@ngrx/effects";

import { Good, GoodsNgrxModule } from "./goods.ngrx";

// entity

export type Negocio = {
  name: Good;
  productos?: {
    name: string;
    perWeek?: number[];
  }[];
}

// NgRx feature key

const NEGOCIOS_FEATURE_KEY = 'negocios';

// NgRx actions

export const actions = createActionGroup({
  source: NEGOCIOS_FEATURE_KEY,
  events: {

    addNegocio: props<{ negocio: Negocio }>(),
    removeNegocio: props<{ name: string }>(),
    setNegocios: props<{ negocios: Negocio[] }>(),

    setProduct: props<({ negocio: string, index: number, good: string })>(),
    setProductPerWeek: props<({ negocio: string, index: number, nivel: number, perWeek: number })>(),

    persistNegocios: emptyProps(),
    loadNegocios: emptyProps(),
  }
})

export const {
  addNegocio,
  removeNegocio,
  setProduct,
  setProductPerWeek,
  loadNegocios,
} = actions;

// NgRx entity adapter

const adapter = createEntityAdapter<Negocio>({ selectId: negocio => negocio.name });

// NgRx reducer

const NEGOCIOS_REDUCER = createReducer(

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

// NgRx selectors

const selectFeature = createFeatureSelector<EntityState<Negocio>>(NEGOCIOS_FEATURE_KEY);

const {
  selectIds,
  selectAll,
} = adapter.getSelectors();

const allKeys = createSelector(selectFeature, selectIds);
export const allNegocioKeys = createSelector(allKeys, keys => keys.filter((key): key is string => true));
export const todosLosNegocios = createSelector(selectFeature, selectAll);
export const negocio = (key: string | number) => createSelector(selectFeature, (feature) => feature.entities[key]);
export const negocioProductionPerWeek = (name: string, product: Good) => createSelector(negocio(name), (negocio) => (negocio?.productos?.find(it => it.name === product)?.perWeek) ?? []);


// NgRx effects

const negociosChangedEffect = createEffect(
  (
    actions$ = inject(Actions),
  ) => actions$.pipe(
    ofType(
      actions.addNegocio,
      actions.removeNegocio,
      actions.setProduct,
      actions.setProductPerWeek,
    ),
    map(() => actions.persistNegocios()),
  ),
  { functional: true }
);

const persistNegociosEffect = createEffect(
  (
    actions$ = inject(Actions),
    store = inject(Store),
  ) => actions$.pipe(
    ofType(actions.persistNegocios),
    switchMap(() => store.select(todosLosNegocios).pipe(take(1))),
    tap(negocios => localStorage.setItem('negocios', JSON.stringify(negocios))),
  ),
  { functional: true, dispatch: false }
);

const loadNegociosEffect = createEffect(
  (actions$ = inject(Actions)) => actions$.pipe(
    ofType(actions.loadNegocios),
    map(() => actions.setNegocios({ negocios: JSON.parse(localStorage.getItem('negocios') as string ?? '[]') })),
  ),
  { functional: true }
);

const negociosEffects = {
  negociosChangedEffect,
  persistNegociosEffect,
  loadNegociosEffect,
}

// Angular module

@NgModule({
  imports: [
    GoodsNgrxModule,
    StoreModule.forFeature(NEGOCIOS_FEATURE_KEY, NEGOCIOS_REDUCER),
    EffectsModule.forFeature(negociosEffects)
  ]
})
export class NegociosNgrxModule {
  constructor(store: Store) {
    console.log('NegociosNgrxModule initializing');
    store.dispatch(loadNegocios());
  }
}
