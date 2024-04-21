import { NgModule, inject } from "@angular/core";
import { map, switchMap, take, tap } from "rxjs";
import { Store, StoreModule, createActionGroup, createFeatureSelector, createReducer, createSelector, emptyProps, on, props } from "@ngrx/store";
import { Actions, EffectsModule, createEffect, ofType } from "@ngrx/effects";
import { EntityState, createEntityAdapter } from "@ngrx/entity";

import { Line, requireLine } from "../../concepts";
import { CiudadesNgrxModule } from "./ciudades.ngrx";
import { NegociosRuralesNgrxModule } from "./negocios-rurales.ngrx";


// NgRx feature key

const LINES_FEATURE_KEY = 'lines';

// NgRx actions

const actions = createActionGroup({
  source: LINES_FEATURE_KEY,
  events: {

    addLine: props<{ line: Line }>(),
    removeLine: props<{ line: Line }>(),
    setLines: props<{ lines: Line[] }>(),

    persistLines: emptyProps(),
    loadLines: emptyProps(),
  }
})

export const {
  addLine,
  removeLine,
  loadLines,
} = actions;

// NgRx entity adapter

const adapter = createEntityAdapter<Line>();

// NgRx reducer

const LINES_REDUCER = createReducer(

  adapter.getInitialState(),

  on(actions.addLine, (state: EntityState<Line>, p: { line: Line }): EntityState<Line> => adapter.addOne(p.line, state)),
  on(actions.removeLine, (state: EntityState<Line>, p: { line: Line }): EntityState<Line> => adapter.removeOne(p.line.id, state)),
  on(actions.setLines, (state: EntityState<Line>, p: { lines: Line[] }): EntityState<Line> => adapter.setAll(p.lines, state)),
);

// NgRx selectors

const selectFeature = createFeatureSelector<EntityState<Line>>(LINES_FEATURE_KEY);

const {
  selectIds,
  selectAll,
} = adapter.getSelectors();

const allKeys = createSelector(selectFeature, selectIds);
export const allLineKeys = createSelector(allKeys, keys => keys.filter((key): key is string => true));
export const allLines = createSelector(selectFeature, selectAll);
export const providerForDestinationCity = (destinationCity: string) => createSelector(allLines, providers => providers.filter(it => it.destinationCity === destinationCity));
export const providerForRuralProducer = (ruralProducer: string) => createSelector(allLines, providers => providers.filter(it => it.ruralProducer === ruralProducer));

// NgRx effects

const linesChangedEffect = createEffect(
  (
    actions$ = inject(Actions),
  ) => actions$.pipe(
    ofType(
      actions.addLine,
      actions.removeLine,
    ),
    map(() => actions.persistLines()),
  ),
  { functional: true }
);

const persistLinesEffect = createEffect(
  (
    actions$ = inject(Actions),
    store = inject(Store),
  ) => actions$.pipe(
    ofType(actions.persistLines),
    switchMap(() => store.select(allLines).pipe(take(1))),
    tap(lines => localStorage.setItem('lines', JSON.stringify(lines))),
  ),
  { functional: true, dispatch: false }
);

const loadLinesEffect = createEffect(
  (actions$ = inject(Actions)) => actions$.pipe(
    ofType(actions.loadLines),
    map(() => {
      const raw = JSON.parse(localStorage.getItem('lines') as string ?? '[]');
      if (!Array.isArray(raw)) throw new Error('require array');
      const lines = raw.filter(requireLine);
      return actions.setLines({ lines });
    }),
  ),
  { functional: true }
);

const linesEffects = {
  providerConnectionsChangedEffect: linesChangedEffect,
  persistLinesEffect,
  loadLinesEffect,
}

// Angular module

@NgModule({
  imports: [
    CiudadesNgrxModule,
    NegociosRuralesNgrxModule,
    StoreModule.forFeature(LINES_FEATURE_KEY, LINES_REDUCER),
    EffectsModule.forFeature(linesEffects)
  ]
})
export class LinesNgrxModule {
  constructor(store: Store) {
    console.log('LinesNgrxModule initializing');
    store.dispatch(loadLines());
  }
}
