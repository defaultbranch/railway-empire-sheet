import { inject } from "@angular/core";
import { map, switchMap, take, tap } from "rxjs";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";

import { actions } from "./game-date.actions";
import { INITIAL_GAME_DATE, gameDate } from "./game-date.state";


const gameDateChangedEffect = createEffect(
  (
    actions$ = inject(Actions),
  ) => actions$.pipe(
    ofType(actions.setGameDate),
    map(() => actions.persistGameDate()),
  ),
  { functional: true }
);

const persistGameDateEffect = createEffect(
  (
    actions$ = inject(Actions),
    store = inject(Store),
  ) => actions$.pipe(
    ofType(actions.persistGameDate),
    switchMap(() => store.select(gameDate).pipe(take(1))),
    tap(date => localStorage.setItem('game-date', date)),
  ),
  { functional: true, dispatch: false }
);

const loadGameDateEffect = createEffect(
  (actions$ = inject(Actions)) => actions$.pipe(
    ofType(actions.loadGameDate),
    map(() => actions.setGameDate({ date: localStorage.getItem('game-date') as string ?? INITIAL_GAME_DATE })),
  ),
  { functional: true }
);

// publish effects

export const gameDateEffects = {
  gameDateChangedEffect,
  persistGameDateEffect,
  loadGameDateEffect,
}
