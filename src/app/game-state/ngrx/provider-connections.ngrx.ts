import { NgModule, inject } from "@angular/core";
import { map, switchMap, take, tap } from "rxjs";
import { Store, StoreModule, createActionGroup, createFeatureSelector, createReducer, createSelector, emptyProps, on, props } from "@ngrx/store";
import { EntityState, createEntityAdapter } from "@ngrx/entity";
import { Actions, EffectsModule, createEffect, ofType } from "@ngrx/effects";

import { CiudadesNgrxModule } from "./ciudades.ngrx";
import { NegociosRuralesNgrxModule } from "./negocios-rurales.ngrx";
import { Good } from "../../game-config/ngrx/goods.ngrx";

// entity

export type ProviderConnection = {

  ruralProducer: string;
  good: Good;
  destinationCity: string;

  productionFactor?: number;
  demandFactor?: number;
  lastRun?: Date;
};

// NgRx feature key

const PROVIDER_CONNECTIONS_FEATURE_KEY = 'provider-connections';

// NgRx actions

const actions = createActionGroup({
  source: PROVIDER_CONNECTIONS_FEATURE_KEY,
  events: {

    addProviderConnection: props<{ line: ProviderConnection }>(),
    removeProviderConnection: props<{ line: ProviderConnection }>(),
    setProviderConnections: props<{ lines: ProviderConnection[] }>(),
    runProviderConnectionNow: props<{ line: ProviderConnection, date: Date }>(),

    updateProductionFactor: props<{ line: ProviderConnection, factor: number }>(),
    updateDemandFactor: props<{ line: ProviderConnection, factor: number }>(),

    persistProviderConnections: emptyProps(),
    loadProviderConnections: emptyProps(),
  }
})

export const {

  addProviderConnection,
  removeProviderConnection,
  loadProviderConnections,

  updateProductionFactor,
  updateDemandFactor,

  runProviderConnectionNow,

} = actions;

// NgRx entity adapter

const toId = (line: ProviderConnection) => `${line.ruralProducer}---${line.good}---${line.destinationCity}`;

const adapter = createEntityAdapter<ProviderConnection>({ selectId: line => toId(line) });

// NgRx reducer

const PROVIDER_CONNECTIONS_REDUCER = createReducer(

  adapter.getInitialState(),

  on(actions.addProviderConnection, (state: EntityState<ProviderConnection>, p: { line: ProviderConnection }): EntityState<ProviderConnection> => adapter.addOne(p.line, state)),
  on(actions.removeProviderConnection, (state: EntityState<ProviderConnection>, p: { line: ProviderConnection }): EntityState<ProviderConnection> => adapter.removeOne(toId(p.line), state)),
  on(actions.setProviderConnections, (state: EntityState<ProviderConnection>, p: { lines: ProviderConnection[] }): EntityState<ProviderConnection> => adapter.setAll(p.lines, state)),

  on(actions.updateDemandFactor, (state: EntityState<ProviderConnection>, p: { line: ProviderConnection, factor: number }): EntityState<ProviderConnection> => adapter.mapOne({ id: toId(p.line), map: it => ({ ...it, demandFactor: p.factor }) }, state)),
  on(actions.updateProductionFactor, (state: EntityState<ProviderConnection>, p: { line: ProviderConnection, factor: number }): EntityState<ProviderConnection> => adapter.mapOne({ id: toId(p.line), map: it => ({ ...it, productionFactor: p.factor }) }, state)),

  on(actions.runProviderConnectionNow, (state: EntityState<ProviderConnection>, p: { line: ProviderConnection, date: Date }): EntityState<ProviderConnection> => adapter.mapOne({
    id: toId(p.line),
    map: line => ({
      ...line,
      lastRun: p.date
    })
  }, state)),
);

// NgRx selectors

const selectFeature = createFeatureSelector<EntityState<ProviderConnection>>(PROVIDER_CONNECTIONS_FEATURE_KEY);

const {
  selectIds,
  selectAll,
} = adapter.getSelectors();

const allKeys = createSelector(selectFeature, selectIds);
export const allProviderConnectionKeys = createSelector(allKeys, keys => keys.filter((key): key is string => true));
export const allProviderConnections = createSelector(selectFeature, selectAll);
export const providerForDestinationCity = (destinationCity: string) => createSelector(allProviderConnections, providers => providers.filter(it => it.destinationCity === destinationCity));
export const providerForRuralProducer = (ruralProducer: string) => createSelector(allProviderConnections, providers => providers.filter(it => it.ruralProducer === ruralProducer));
export const providersForCityAndGood = (city: string, good: Good) => createSelector(allProviderConnections, providers => providers.filter(it => it.destinationCity === city && it.good === good));

// NgRx effects

const providerConnectionsChangedEffect = createEffect(
  (
    actions$ = inject(Actions),
  ) => actions$.pipe(
    ofType(
      actions.addProviderConnection,
      actions.removeProviderConnection,
      actions.updateDemandFactor,
      actions.updateProductionFactor,
      actions.runProviderConnectionNow,
    ),
    map(() => actions.persistProviderConnections()),
  ),
  { functional: true }
);

const persistProviderConnectionsEffect = createEffect(
  (
    actions$ = inject(Actions),
    store = inject(Store),
  ) => actions$.pipe(
    ofType(actions.persistProviderConnections),
    switchMap(() => store.select(allProviderConnections).pipe(take(1))),
    tap(lines => localStorage.setItem('provider-connections', JSON.stringify(lines))),
  ),
  { functional: true, dispatch: false }
);

const loadProviderConnectionsEffect = createEffect(
  (actions$ = inject(Actions)) => actions$.pipe(
    ofType(actions.loadProviderConnections),
    map(() => actions.setProviderConnections({ lines: JSON.parse(localStorage.getItem('provider-connections') as string ?? '[]') })),
  ),
  { functional: true }
);

const providerConnectionsEffects = {
  providerConnectionsChangedEffect,
  persistProviderConnectionsEffect,
  loadProviderConnectionsEffect,
}

// Angular module

@NgModule({
  imports: [
    CiudadesNgrxModule,
    NegociosRuralesNgrxModule,
    StoreModule.forFeature(PROVIDER_CONNECTIONS_FEATURE_KEY, PROVIDER_CONNECTIONS_REDUCER),
    EffectsModule.forFeature(providerConnectionsEffects)
  ]
})
export class ProviderConnectionsNgrxModule {
  constructor(store: Store) {
    console.log('ProviderConnectionsNgrxModule initializing');
    store.dispatch(loadProviderConnections());
  }
}
