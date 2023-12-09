import { EntityState, createEntityAdapter } from "@ngrx/entity";
import { createFeatureSelector, createReducer, createSelector, on } from "@ngrx/store";

import { DirectLine } from "./direct-line";
import { DIRECT_LINES_FEATURE_KEY, actions } from "./direct-lines.actions";

const toId = (line: DirectLine) => `${line.ruralProducer}---${line.good}---${line.destinationCity}`;

const adapter = createEntityAdapter<DirectLine>({ selectId: line => toId(line) });

export const DIRECT_LINES_REDUCER = createReducer(

  adapter.getInitialState(),

  on(actions.addDirectLine, (state: EntityState<DirectLine>, p: { line: DirectLine }): EntityState<DirectLine> => adapter.addOne(p.line, state)),
  on(actions.removeDirectLine, (state: EntityState<DirectLine>, p: { line: DirectLine }): EntityState<DirectLine> => adapter.removeOne(toId(p.line), state)),
  on(actions.setDirectLines, (state: EntityState<DirectLine>, p: { lines: DirectLine[] }): EntityState<DirectLine> => adapter.setAll(p.lines, state)),

  on(actions.runDirectLineNow, (state: EntityState<DirectLine>, p: { line: DirectLine, date: Date }): EntityState<DirectLine> => adapter.mapOne({
    id: toId(p.line),
    map: line => ({
      ...line,
      lastRun: p.date
    })
  }, state)),
);

// selectors

const selectFeature = createFeatureSelector<EntityState<DirectLine>>(DIRECT_LINES_FEATURE_KEY);

const {
  selectAll,
} = adapter.getSelectors();

export const allLines = createSelector(selectFeature, selectAll);
