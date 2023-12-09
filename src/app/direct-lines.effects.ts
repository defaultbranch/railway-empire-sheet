import { inject } from "@angular/core";
import { map, switchMap, take, tap } from "rxjs";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";

import { actions } from "./direct-lines.actions";
import { allLines } from "./direct-lines.state";

const directLinesChangedEffect = createEffect(
  (
    actions$ = inject(Actions),
  ) => actions$.pipe(
    ofType(
      actions.addDirectLine,
      actions.removeDirectLine,
      actions.runDirectLineNow,
    ),
    map(() => actions.persistDirectLines()),
  ),
  { functional: true }
);

const persistDirectLinesEffect = createEffect(
  (
    actions$ = inject(Actions),
    store = inject(Store),
  ) => actions$.pipe(
    ofType(actions.persistDirectLines),
    switchMap(() => store.select(allLines).pipe(take(1))),
    tap(lines => localStorage.setItem('direct-lines', JSON.stringify(lines))),
  ),
  { functional: true, dispatch: false }
);

const loadDirectLinesEffect = createEffect(
  (actions$ = inject(Actions)) => actions$.pipe(
    ofType(actions.loadDirectLines),
    map(() => actions.setDirectLines({ lines: JSON.parse(localStorage.getItem('direct-lines') as string ?? '[]') })),
  ),
  { functional: true }
);

// publish effects

export const directLinesEffects = {
  directLinesChangedEffect,
  persistDirectLinesEffect,
  loadDirectLinesEffect,
}
