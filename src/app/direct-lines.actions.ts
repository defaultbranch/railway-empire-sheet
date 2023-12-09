import { createActionGroup, emptyProps, props } from "@ngrx/store";
import { DirectLine } from "./direct-line";

export const DIRECT_LINES_FEATURE_KEY = 'direct-lines';

export const actions = createActionGroup({
  source: DIRECT_LINES_FEATURE_KEY,
  events: {

    addDirectLine: props<{ line: DirectLine }>(),
    removeDirectLine: props<{ line: DirectLine }>(),
    setDirectLines: props<{ lines: DirectLine[] }>(),
    runDirectLineNow: props<{ line: DirectLine, date: Date }>(),

    persistDirectLines: emptyProps(),
    loadDirectLines: emptyProps(),
  }
})

// public actions

export const {

  addDirectLine,
  removeDirectLine,
  loadDirectLines,

  runDirectLineNow,

} = actions;
