import { StoreModule, createActionGroup, emptyProps, props } from "@ngrx/store";
import { EntityState, createEntityAdapter } from "@ngrx/entity";
import { createFeatureSelector, createReducer, createSelector, on } from "@ngrx/store";
import { NgModule, inject } from "@angular/core";
import { map, switchMap, take, tap } from "rxjs";
import { Actions, EffectsModule, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { ProviderConnectionsNgrxModule } from "./provider-connections.ngrx";

// entity

export type DirectLine = {

  ruralProducer: string;
  destinationCity: string;

  miles: number;
  cost: number;
};

// NgRx feature key

const DIRECT_LINES_FEATURE_KEY = 'direct-lines';

// NgRx actions

const actions = createActionGroup({
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

const DIRECT_LINES_REDUCER = createReducer(

  adapter.getInitialState(),

  on(actions.addDirectLine, (state: EntityState<DirectLine>, p: { line: DirectLine }): EntityState<DirectLine> => adapter.addOne(p.line, state)),
  on(actions.removeDirectLine, (state: EntityState<DirectLine>, p: { line: DirectLine }): EntityState<DirectLine> => adapter.removeOne(toId(p.line), state)),
  on(actions.setDirectLines, (state: EntityState<DirectLine>, p: { lines: DirectLine[] }): EntityState<DirectLine> => adapter.setAll(p.lines, state)),
);

// NgRx selectors

const selectFeature = createFeatureSelector<EntityState<DirectLine>>(DIRECT_LINES_FEATURE_KEY);

const {
  selectIds,
  selectAll,
} = adapter.getSelectors();

const allKeys = createSelector(selectFeature, selectIds);
export const allDirectLineKeys = createSelector(allKeys, keys => keys.filter((key): key is string => true));
export const allLines = createSelector(selectFeature, selectAll);
const line = (ruralProducer: string, destinationCity: string) => createSelector(selectFeature, (feature) => feature.entities[`${ruralProducer}---${destinationCity}`]);
export const miles = (ruralProducer: string, destinationCity: string) => createSelector(line(ruralProducer, destinationCity), (line) => line?.miles);
export const cost = (ruralProducer: string, destinationCity: string) => createSelector(line(ruralProducer, destinationCity), (line) => line?.cost);

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

const directLinesEffects = {
  directLinesChangedEffect,
  persistDirectLinesEffect,
  loadDirectLinesEffect,
}

// Angular module

@NgModule({
  imports: [
    ProviderConnectionsNgrxModule,
    StoreModule.forFeature(DIRECT_LINES_FEATURE_KEY, DIRECT_LINES_REDUCER),
    EffectsModule.forFeature(directLinesEffects)
  ]
})
export class DirectLinesNgrxModule {
  constructor(store: Store) {
    console.log('DirectLinesNgrxModule initializing');
    store.dispatch(loadDirectLines());
  }
}
