import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { switchMap, take, tap } from "rxjs";

import { actions } from "./ciudad.actions";
import { todosLosCiudades } from "./ciudad.state";

const persistCiudades = createEffect(
  (
    actions$ = inject(Actions),
    store = inject(Store),
  ) => actions$.pipe(
    ofType(
      actions.addCiudad,
      actions.removeCiudad,
    ),
    switchMap(() => store.select(todosLosCiudades).pipe(take(1))),
    tap(ciudades => localStorage.setItem('ciudades', JSON.stringify(ciudades))),
  ),
  { functional: true, dispatch: false }
);

// publish effects

export const ciudadesEffects = {
  persistCiudades,
}
