import { createActionGroup, emptyProps, props } from "@ngrx/store";

export const GAME_DATE_FEATURE_KEY = 'game-date';

export const actions = createActionGroup({
  source: GAME_DATE_FEATURE_KEY,
  events: {

    setGameDate: props<{ date: string }>(),

    persistGameDate: emptyProps(),
    loadGameDate: emptyProps(),
  }
})

// public actions

export const {
  setGameDate,
  loadGameDate,
} = actions;
