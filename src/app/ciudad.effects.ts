import { inject } from "@angular/core";
import { map, switchMap, take, tap } from "rxjs";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";

import { actions } from "./ciudad.actions";
import { todosLosCiudades } from "./ciudad.state";

const ciudadesChangedEffect = createEffect(
  (
    actions$ = inject(Actions),
  ) => actions$.pipe(
    ofType(
      actions.addCiudad,
      actions.removeCiudad,
    ),
    map(() => actions.persistCiudades()),
  ),
  { functional: true }
);

const persistCiudadesEffect = createEffect(
  (
    actions$ = inject(Actions),
    store = inject(Store),
  ) => actions$.pipe(
    ofType(actions.persistCiudades),
    switchMap(() => store.select(todosLosCiudades).pipe(take(1))),
    tap(ciudades => localStorage.setItem('ciudades', JSON.stringify(ciudades))),
  ),
  { functional: true, dispatch: false }
);

const loadCiudadesEffect = createEffect(
  (actions$ = inject(Actions)) => actions$.pipe(
    ofType(actions.loadCiudades),
    map(() => actions.setCiudades({ ciudades: JSON.parse(localStorage.getItem('ciudades') as string ?? '[]') })),
  ),
  { functional: true }
);

// publish effects

export const ciudadesEffects = {
  ciudadesChangedEffect,
  persistCiudadesEffect,
  loadCiudadesEffect,
}
