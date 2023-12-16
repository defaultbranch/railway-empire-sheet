import { createActionGroup, emptyProps, props } from "@ngrx/store";
import { EntityState, createEntityAdapter } from "@ngrx/entity";
import { createFeatureSelector, createReducer, createSelector, on } from "@ngrx/store";
import { inject } from "@angular/core";
import { map, switchMap, take, tap } from "rxjs";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";

// entity

export type Good = string;

// NgRx feature key

export const GOODS_FEATURE_KEY = 'goods';

// NgRx actions

export const actions = createActionGroup({
  source: GOODS_FEATURE_KEY,
  events: {

    addGood: props<({ good: string })>(),
    removeGood: props<({ good: string })>(),
    setGoods: props<{ goods: string[] }>(),

    persistGoods: emptyProps(),
    loadGoods: emptyProps(),
  }
})

export const {
  addGood,
  removeGood,
  loadGoods,
} = actions;

// NgRx entity adapter

const adapter = createEntityAdapter<string>({ selectId: good => good });

// NgRx reducer

export const GOOD_REDUCER = createReducer(

  adapter.getInitialState(),

  on(actions.addGood, (state: EntityState<string>, p: { good: string }): EntityState<string> => adapter.addOne(p.good, state)),
  on(actions.removeGood, (state: EntityState<string>, p: { good: string }): EntityState<string> => adapter.removeOne(p.good, state)),
  on(actions.setGoods, (state: EntityState<string>, p: { goods: string[] }): EntityState<string> => adapter.setAll(p.goods, state)),
);

// NgRx selectors

const selectFeature = createFeatureSelector<EntityState<string>>(GOODS_FEATURE_KEY);

const {
  selectAll,
} = adapter.getSelectors();

export const allGoods = createSelector(selectFeature, selectAll);

// NgRx effects

const goodsChangedEffect = createEffect(
  (
    actions$ = inject(Actions),
  ) => actions$.pipe(
    ofType(
      actions.addGood,
      actions.removeGood,
    ),
    map(() => actions.persistGoods()),
  ),
  { functional: true }
);

const persistGoodsEffect = createEffect(
  (
    actions$ = inject(Actions),
    store = inject(Store),
  ) => actions$.pipe(
    ofType(actions.persistGoods),
    switchMap(() => store.select(allGoods).pipe(take(1))),
    tap(goods => localStorage.setItem('goods', JSON.stringify(goods))),
  ),
  { functional: true, dispatch: false }
);

const loadGoodsEffect = createEffect(
  (actions$ = inject(Actions)) => actions$.pipe(
    ofType(actions.loadGoods),
    map(() => actions.setGoods({ goods: JSON.parse(localStorage.getItem('goods') as string ?? '[]') })),
  ),
  { functional: true }
);

export const goodsEffects = {
  goodsChangedEffect,
  persistGoodsEffect,
  loadGoodsEffect,
}
