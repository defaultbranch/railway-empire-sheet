import { createActionGroup, emptyProps, props } from "@ngrx/store";
import { createFeatureSelector, createReducer, createSelector, on } from "@ngrx/store";
import { inject } from "@angular/core";
import { map, switchMap, take, tap } from "rxjs";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";

// entity

export type GameDate = string;

// NgRx feature key

export const GAME_DATE_FEATURE_KEY = 'game-date';

// NgRx actions

export const actions = createActionGroup({
  source: GAME_DATE_FEATURE_KEY,
  events: {

    setGameDate: props<{ date: GameDate }>(),

    persistGameDate: emptyProps(),
    loadGameDate: emptyProps(),
  }
})

export const {
  setGameDate,
  loadGameDate,
} = actions;

// NgRx initial value

export const INITIAL_GAME_DATE = '1910-01-01';

// NgRx reducer

export const GAME_DATE_REDUCER = createReducer(
  INITIAL_GAME_DATE,
  on(actions.setGameDate, (state: string, p: { date: GameDate }): string => p.date),
);

// NgRx selectors

const selectFeature = createFeatureSelector<string>(GAME_DATE_FEATURE_KEY);

export const gameDate = createSelector(selectFeature, it => it);

// NgRx effects

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

export const gameDateEffects = {
  gameDateChangedEffect,
  persistGameDateEffect,
  loadGameDateEffect,
}
