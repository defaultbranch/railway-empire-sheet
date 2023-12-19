import { StoreModule, createActionGroup, emptyProps, props } from "@ngrx/store";
import { EntityState, createEntityAdapter } from "@ngrx/entity";
import { createFeatureSelector, createReducer, createSelector, on } from "@ngrx/store";
import { NgModule, inject } from "@angular/core";
import { map, switchMap, take, tap } from "rxjs";
import { Actions, EffectsModule, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";

// entity

export type Good = string;

// NgRx feature key

const GOODS_FEATURE_KEY = 'goods';

// NgRx actions

const actions = createActionGroup({
  source: GOODS_FEATURE_KEY,
  events: {

    addGood: props<({ good: Good })>(),
    removeGood: props<({ good: Good })>(),
    setGoods: props<{ goods: Good[] }>(),

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

const adapter = createEntityAdapter<Good>({ selectId: good => good });

// NgRx reducer

const GOOD_REDUCER = createReducer(

  adapter.getInitialState(),

  on(actions.addGood, (state: EntityState<Good>, p: { good: Good }): EntityState<Good> => adapter.addOne(p.good, state)),
  on(actions.removeGood, (state: EntityState<Good>, p: { good: Good }): EntityState<Good> => adapter.removeOne(p.good, state)),
  on(actions.setGoods, (state: EntityState<Good>, p: { goods: Good[] }): EntityState<Good> => adapter.setAll(p.goods, state)),
);

// NgRx selectors

const selectFeature = createFeatureSelector<EntityState<Good>>(GOODS_FEATURE_KEY);

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

const goodsEffects = {
  goodsChangedEffect,
  persistGoodsEffect,
  loadGoodsEffect,
}

// Angular module

@NgModule({
  imports: [
    StoreModule.forFeature(GOODS_FEATURE_KEY, GOOD_REDUCER),
    EffectsModule.forFeature(goodsEffects)
  ]
})
export class GoodsNgrxModule {
  constructor(store: Store) {
    console.log('GoodsNgrxModule initializing');
    store.dispatch(loadGoods());
  }
}
