import { inject } from "@angular/core";
import { map, switchMap, take, tap } from "rxjs";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";

import { actions } from "./industrias.actions";
import { allIndustries } from "./industrias.state";

const industriasChangedEffect = createEffect(
  (
    actions$ = inject(Actions),
  ) => actions$.pipe(
    ofType(
      actions.addIndustria,
      actions.removeIndustria,
      actions.setMateriaPrima,
      actions.setProduct,
    ),
    map(() => actions.persistIndustrias()),
  ),
  { functional: true }
);

const persistIndustriasEffect = createEffect(
  (
    actions$ = inject(Actions),
    store = inject(Store),
  ) => actions$.pipe(
    ofType(actions.persistIndustrias),
    switchMap(() => store.select(allIndustries).pipe(take(1))),
    tap(industrias => localStorage.setItem('industrias', JSON.stringify(industrias))),
  ),
  { functional: true, dispatch: false }
);

const loadIndustriasEffect = createEffect(
  (actions$ = inject(Actions)) => actions$.pipe(
    ofType(actions.loadIndustrias),
    map(() => actions.setIndustrias({ industrias: JSON.parse(localStorage.getItem('industrias') as string ?? '[]') })),
  ),
  { functional: true }
);

// publish effects

export const industriasEffects = {
  industriasChangedEffect,
  persistIndustriasEffect,
  loadIndustriasEffect,
}
