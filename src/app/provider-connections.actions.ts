import { createActionGroup, emptyProps, props } from "@ngrx/store";
import { ProviderConnection } from "./provider-connection";

export const PROVIDER_CONNECTIONS_FEATURE_KEY = 'provider-connections';

export const actions = createActionGroup({
  source: PROVIDER_CONNECTIONS_FEATURE_KEY,
  events: {

    addProviderConnection: props<{ line: ProviderConnection }>(),
    removeProviderConnection: props<{ line: ProviderConnection }>(),
    setProviderConnections: props<{ lines: ProviderConnection[] }>(),
    runProviderConnectionNow: props<{ line: ProviderConnection, date: Date }>(),

    persistProviderConnections: emptyProps(),
    loadProviderConnections: emptyProps(),
  }
})

// public actions

export const {

  addProviderConnection,
  removeProviderConnection,
  loadProviderConnections,

  runProviderConnectionNow,

} = actions;
