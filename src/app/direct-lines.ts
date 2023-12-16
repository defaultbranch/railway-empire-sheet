import { createActionGroup, emptyProps, props } from "@ngrx/store";
import { EntityState, createEntityAdapter } from "@ngrx/entity";
import { createFeatureSelector, createReducer, createSelector, on } from "@ngrx/store";
import { inject } from "@angular/core";
import { map, switchMap, take, tap } from "rxjs";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";

// entity

export type DirectLine = {

  ruralProducer: string;
  destinationCity: string;

  miles: number;
  cost: number;
};

// NgRx feature key

export const DIRECT_LINES_FEATURE_KEY = 'direct-lines';

// NgRx actions

export const actions = createActionGroup({
  source: DIRECT_LINES_FEATURE_KEY,
  events: {

    addDirectLine: props<{ line: DirectLine }>(),
    removeDirectLine: props<{ line: DirectLine }>(),
    setDirectLines: props<{ lines: DirectLine[] }>(),

    persistDirectLines: emptyProps(),
    loadDirectLines: emptyProps(),
  }
})

export const {

  addDirectLine,
  removeDirectLine,
  loadDirectLines,

} = actions;

// NgRx entity adapter

const toId = (line: DirectLine) => `${line.ruralProducer}---${line.destinationCity}`;

const adapter = createEntityAdapter<DirectLine>({ selectId: line => toId(line) });

// NgRx reducer

export const DIRECT_LINES_REDUCER = createReducer(

  adapter.getInitialState(),

  on(actions.addDirectLine, (state: EntityState<DirectLine>, p: { line: DirectLine }): EntityState<DirectLine> => adapter.addOne(p.line, state)),
  on(actions.removeDirectLine, (state: EntityState<DirectLine>, p: { line: DirectLine }): EntityState<DirectLine> => adapter.removeOne(toId(p.line), state)),
  on(actions.setDirectLines, (state: EntityState<DirectLine>, p: { lines: DirectLine[] }): EntityState<DirectLine> => adapter.setAll(p.lines, state)),
);

// NgRx selectors

const selectFeature = createFeatureSelector<EntityState<DirectLine>>(DIRECT_LINES_FEATURE_KEY);

const {
  selectAll,
} = adapter.getSelectors();

export const allLines = createSelector(selectFeature, selectAll);

// NgRx effects

const directLinesChangedEffect = createEffect(
  (
    actions$ = inject(Actions),
  ) => actions$.pipe(
    ofType(
      actions.addDirectLine,
      actions.removeDirectLine,
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

export const directLinesEffects = {
  directLinesChangedEffect,
  persistDirectLinesEffect,
  loadDirectLinesEffect,
}
