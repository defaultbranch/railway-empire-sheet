import { inject } from "@angular/core";
import { map, switchMap, take, tap } from "rxjs";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";

import { actions } from "./goods.actions";
import { allGoods } from "./goods.state";

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
    map(() => actions.setGoods({ goods: JSON.parse(localStorage.getItem('goods') as string) })),
  ),
  { functional: true }
);

// publish effects

export const goodsEffects = {
  goodsChangedEffect,
  persistGoodsEffect,
  loadGoodsEffect,
}
