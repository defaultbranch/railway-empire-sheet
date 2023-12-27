import { StoreModule, createActionGroup, emptyProps, props } from "@ngrx/store";
import { EntityState, createEntityAdapter } from "@ngrx/entity";
import { createFeatureSelector, createReducer, createSelector, on } from "@ngrx/store";
import { NgModule, inject } from "@angular/core";
import { map, switchMap, take, tap } from "rxjs";
import { Actions, EffectsModule, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";

import { Good, GoodsNgrxModule } from "./goods.ngrx";

// entity

export type Demand = {
  good: Good,
  minCitySize: number,
  wagonsPerMillion: number,
}

// NgRx feature key

const DEMANDS_FEATURE_KEY = 'demands';

// NgRx actions

const actions = createActionGroup({
  source: DEMANDS_FEATURE_KEY,
  events: {

    upsertDemand: props<{ demand: Demand }>(),
    removeDemand: props<({ good: Good })>(),
    setDemands: props<{ demands: Demand[] }>(),

    persistDemands: emptyProps(),
    loadDemands: emptyProps(),
  }
});

export const {
  upsertDemand,
  removeDemand,
  loadDemands,
} = actions;

// NgRx entity adapter

const adapter = createEntityAdapter<Demand>({ selectId: demand => demand.good });

// NgRx reducer

const INDUSTRIAS_REDUCER = createReducer(

  adapter.getInitialState(),

  on(actions.upsertDemand, (state: EntityState<Demand>, p: { demand: Demand }): EntityState<Demand> => adapter.upsertOne(p.demand, state)),
  on(actions.removeDemand, (state: EntityState<Demand>, p: { good: Good }): EntityState<Demand> => adapter.removeOne(p.good, state)),
  on(actions.setDemands, (state: EntityState<Demand>, p: { demands: Demand[] }): EntityState<Demand> => adapter.setAll(p.demands, state)),

);

// NgRx selectors

const selectFeature = createFeatureSelector<EntityState<Demand>>(DEMANDS_FEATURE_KEY);

const {
  selectAll,
} = adapter.getSelectors();

export const allDemands = createSelector(selectFeature, selectAll);

// NgRx effects

const demandsChangedEffect = createEffect(
  (
    actions$ = inject(Actions),
  ) => actions$.pipe(
    ofType(
      actions.upsertDemand,
      actions.removeDemand,
    ),
    map(() => actions.persistDemands()),
  ),
  { functional: true }
);

const persistDemandsEffect = createEffect(
  (
    actions$ = inject(Actions),
    store = inject(Store),
  ) => actions$.pipe(
    ofType(actions.persistDemands),
    switchMap(() => store.select(allDemands).pipe(take(1))),
    tap(demands => localStorage.setItem('demands', JSON.stringify(demands))),
  ),
  { functional: true, dispatch: false }
);

const loadDemandsEffect = createEffect(
  (actions$ = inject(Actions)) => actions$.pipe(
    ofType(actions.loadDemands),
    map(() => actions.setDemands({ demands: JSON.parse(localStorage.getItem('demands') as string ?? '[]') })),
  ),
  { functional: true }
);

const demandsEffects = {
  demandsChangedEffect,
  persistDemandsEffect,
  loadDemandsEffect,
}

// Angular module

@NgModule({
  imports: [
    GoodsNgrxModule,
    StoreModule.forFeature(DEMANDS_FEATURE_KEY, INDUSTRIAS_REDUCER),
    EffectsModule.forFeature(demandsEffects)
  ]
})
export class DemandsNgrxModule {
  constructor(store: Store) {
    console.log('DemandsNgrxModule initializing');
    store.dispatch(loadDemands());
  }
}
