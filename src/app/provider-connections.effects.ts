import { inject } from "@angular/core";
import { map, switchMap, take, tap } from "rxjs";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";

import { actions } from "./provider-connections.actions";
import { allProviderConnections } from "./provider-connections.state";

const providerConnectionsChangedEffect = createEffect(
  (
    actions$ = inject(Actions),
  ) => actions$.pipe(
    ofType(
      actions.addProviderConnection,
      actions.removeProviderConnection,
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

// publish effects

export const providerConnectionsEffects = {
  providerConnectionsChangedEffect,
  persistProviderConnectionsEffect,
  loadProviderConnectionsEffect,
}
