import { NgModule, inject } from "@angular/core";
import { map, switchMap, take, tap } from "rxjs";
import { Store, StoreModule, createActionGroup, createFeatureSelector, createReducer, createSelector, emptyProps, on, props } from "@ngrx/store";
import { EntityState, createEntityAdapter } from "@ngrx/entity";
import { Actions, EffectsModule, createEffect, ofType } from "@ngrx/effects";

import { NegociosNgrxModule } from "../game-config/ngrx/negocios.ngrx";

// entity

export type NegocioRural = {
  name: string;
  size: number;
  product: string;
  perWeek: number;
}

// NgRx feature key

const NEGOCIOS_RURALES_FEATURE_KEY = 'negocios-rurales';

// NgRx actions

const actions = createActionGroup({
  source: NEGOCIOS_RURALES_FEATURE_KEY,
  events: {

    addNegocioRural: props<{ negocio: NegocioRural }>(),
    removeNegocioRural: props<{ nombre: string }>(),
    setNegociosRurales: props<{ negocios: NegocioRural[] }>(),

    updateNegocioRural: props<{ negocio: NegocioRural, perWeek?: number }>(),

    persistNegociosRurales: emptyProps(),
    loadNegociosRurales: emptyProps(),
  }
})

export const {
  addNegocioRural,
  removeNegocioRural,
  updateNegocioRural,
  loadNegociosRurales,
} = actions;

// NgRx entity adapter

const adapter = createEntityAdapter<NegocioRural>({ selectId: negocio => negocio.name });

// NgRx reducer

const NEGOCIOS_RURALES_REDUCER = createReducer(

  adapter.getInitialState(),

  on(actions.addNegocioRural, (state: EntityState<NegocioRural>, p: { negocio: NegocioRural }): EntityState<NegocioRural> => adapter.addOne(p.negocio, state)),
  on(actions.removeNegocioRural, (state: EntityState<NegocioRural>, p: { nombre: string }): EntityState<NegocioRural> => adapter.removeOne(p.nombre, state)),
  on(actions.setNegociosRurales, (state: EntityState<NegocioRural>, p: { negocios: NegocioRural[] }): EntityState<NegocioRural> => adapter.setAll(p.negocios, state)),

  on(actions.updateNegocioRural, (state: EntityState<NegocioRural>, p: { negocio: NegocioRural, perWeek?: number }): EntityState<NegocioRural> => adapter.mapOne({
    id: p.negocio.name,
    map: negocio => ({
      ...negocio,
      perWeek: p.perWeek ?? p.negocio.perWeek
    })
  }, state))
);

// NgRx selectors

const selectFeature = createFeatureSelector<EntityState<NegocioRural>>(NEGOCIOS_RURALES_FEATURE_KEY);

const {
  selectAll,
} = adapter.getSelectors();

export const todosLosNegociosRurales = createSelector(selectFeature, selectAll);

// NgRx effects

const negociosChangedEffect = createEffect(
  (
    actions$ = inject(Actions),
  ) => actions$.pipe(
    ofType(
      actions.addNegocioRural,
      actions.removeNegocioRural,
      actions.updateNegocioRural,
    ),
    map(() => actions.persistNegociosRurales()),
  ),
  { functional: true }
);

const persistNegociosEffect = createEffect(
  (
    actions$ = inject(Actions),
    store = inject(Store),
  ) => actions$.pipe(
    ofType(actions.persistNegociosRurales),
    switchMap(() => store.select(todosLosNegociosRurales).pipe(take(1))),
    tap(negocios => localStorage.setItem('negocios-rurales', JSON.stringify(negocios))),
  ),
  { functional: true, dispatch: false }
);

const loadNegociosEffect = createEffect(
  (actions$ = inject(Actions)) => actions$.pipe(
    ofType(actions.loadNegociosRurales),
    map(() => actions.setNegociosRurales({ negocios: JSON.parse(localStorage.getItem('negocios-rurales') as string ?? '[]') })),
  ),
  { functional: true }
);

const negociosRuralesEffects = {
  negociosChangedEffect,
  persistNegociosEffect,
  loadNegociosEffect,
}

// Angular module

@NgModule({
  imports: [
    NegociosNgrxModule,
    StoreModule.forFeature(NEGOCIOS_RURALES_FEATURE_KEY, NEGOCIOS_RURALES_REDUCER),
    EffectsModule.forFeature(negociosRuralesEffects)
  ]
})
export class NegociosRuralesNgrxModule {
  constructor(store: Store) {
    console.log('NegociosRuralesNgrxModule initializing');
    store.dispatch(loadNegociosRurales());
  }
}
