import { inject } from "@angular/core";
import { map, switchMap, take, tap } from "rxjs";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";

import { actions } from "./negocio-rural.actions";
import { todosLosNegociosRurales } from "./negocio-rural.state";

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

// publish effects

export const negociosRuralesEffects = {
  negociosChangedEffect,
  persistNegociosEffect,
  loadNegociosEffect,
}
