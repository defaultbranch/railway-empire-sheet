import { EntityState, createEntityAdapter } from "@ngrx/entity";
import { createFeatureSelector, createReducer, createSelector, on } from "@ngrx/store";

import { ProviderConnection } from "./provider-connection";
import { PROVIDER_CONNECTIONS_FEATURE_KEY, actions } from "./provider-connections.actions";

const toId = (line: ProviderConnection) => `${line.ruralProducer}---${line.good}---${line.destinationCity}`;

const adapter = createEntityAdapter<ProviderConnection>({ selectId: line => toId(line) });

export const PROVIDER_CONNECTIONS_REDUCER = createReducer(

  adapter.getInitialState(),

  on(actions.addProviderConnection, (state: EntityState<ProviderConnection>, p: { line: ProviderConnection }): EntityState<ProviderConnection> => adapter.addOne(p.line, state)),
  on(actions.removeProviderConnection, (state: EntityState<ProviderConnection>, p: { line: ProviderConnection }): EntityState<ProviderConnection> => adapter.removeOne(toId(p.line), state)),
  on(actions.setProviderConnections, (state: EntityState<ProviderConnection>, p: { lines: ProviderConnection[] }): EntityState<ProviderConnection> => adapter.setAll(p.lines, state)),

  on(actions.runProviderConnectionNow, (state: EntityState<ProviderConnection>, p: { line: ProviderConnection, date: Date }): EntityState<ProviderConnection> => adapter.mapOne({
    id: toId(p.line),
    map: line => ({
      ...line,
      lastRun: p.date
    })
  }, state)),
);

// selectors

const selectFeature = createFeatureSelector<EntityState<ProviderConnection>>(PROVIDER_CONNECTIONS_FEATURE_KEY);

const {
  selectAll,
} = adapter.getSelectors();

export const allProviderConnections = createSelector(selectFeature, selectAll);
