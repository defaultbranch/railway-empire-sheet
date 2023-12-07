import { EntityState, createEntityAdapter } from "@ngrx/entity";
import { createFeatureSelector, createReducer, createSelector, on } from "@ngrx/store";

import { GAME_DATE_FEATURE_KEY, actions } from "./game-date.actions";

export const INITIAL_GAME_DATE = '1910-01-01';

export const GAME_DATE_REDUCER = createReducer(
  INITIAL_GAME_DATE,
  on(actions.setGameDate, (state: string, p: { date: string }): string => p.date),
);

// selectors

const selectFeature = createFeatureSelector<string>(GAME_DATE_FEATURE_KEY);

export const gameDate = createSelector(selectFeature, it => it);
