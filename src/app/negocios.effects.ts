import { inject } from "@angular/core";
import { map, switchMap, take, tap } from "rxjs";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";

import { actions } from "./negocios.actions";
import { todosLosNegocios } from "./negocios.state";

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

// publish effects

export const negociosEffects = {
  negociosChangedEffect,
  persistNegociosEffect,
  loadNegociosEffect,
}
