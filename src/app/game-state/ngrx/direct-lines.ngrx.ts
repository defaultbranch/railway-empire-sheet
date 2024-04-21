import { NgModule, inject } from "@angular/core";
import { map, switchMap, take, tap } from "rxjs";
import { Store, StoreModule, createActionGroup, emptyProps, props,createFeatureSelector, createReducer, createSelector, on } from "@ngrx/store";
import { Actions, EffectsModule, createEffect, ofType } from "@ngrx/effects";
import { EntityState, createEntityAdapter } from "@ngrx/entity";
import { v4 as uuidv4 } from 'uuid';

import { DirectLine, requireDirectline } from "../../concepts";
import { ProviderConnectionsNgrxModule } from "./provider-connections.ngrx";



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
    map(() => {
      const raw = JSON.parse(localStorage.getItem('direct-lines') as string ?? '[]');
      if (!Array.isArray(raw)) throw new Error('require array');
      const lines = raw.filter(requireDirectline).map(it => it.id ? {...it, type: 'DirectLine'} as const : {...it, type: 'DirectLine', id: uuidv4()} as const);
      return actions.setDirectLines({ lines });
    }),
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
