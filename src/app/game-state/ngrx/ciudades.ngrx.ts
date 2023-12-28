import { NgModule, inject } from "@angular/core";
import { map, switchMap, take, tap } from "rxjs";
import { Store, StoreModule, createActionGroup, createFeatureSelector, createReducer, createSelector, emptyProps, on, props } from "@ngrx/store";
import { EntityState, createEntityAdapter } from "@ngrx/entity";
import { Actions, EffectsModule, createEffect, ofType } from "@ngrx/effects";

import { IndustriasNgrxModule } from "../../game-config/ngrx/industrias.ngrx";

// entity

export type Ciudad = {
  name: string;
  population: number;
  businesses?: {
    business: string;
    size: number
  }[];
}

// NgRx feature key

const CIUDADES_FEATURE_KEY = 'ciudades';

// NgRx actions

const actions = createActionGroup({
  source: CIUDADES_FEATURE_KEY,
  events: {

    addCiudad: props<{ ciudad: Ciudad }>(),
    removeCiudad: props<{ nombre: string }>(),
    setCiudades: props<{ ciudades: Ciudad[] }>(),

    updatePopulation: props<{ name: string, population: number }>(),
    updateBusiness: props<{ name: string, index: number, business: string, size: number}>(),

    persistCiudades: emptyProps(),
    loadCiudades: emptyProps(),
  }
})

export const {

  addCiudad,
  removeCiudad,
  loadCiudades,

  updatePopulation,
  updateBusiness,

} = actions;

// NgRx entity adapter

const adapter = createEntityAdapter<Ciudad>({ selectId: ciudad => ciudad.name });

// NgRx reducer

const CIUDAD_REDUCER = createReducer(

  adapter.getInitialState(),

  on(actions.addCiudad, (state: EntityState<Ciudad>, p: { ciudad: Ciudad }): EntityState<Ciudad> => adapter.addOne(p.ciudad, state)),
  on(actions.removeCiudad, (state: EntityState<Ciudad>, p: { nombre: string }): EntityState<Ciudad> => adapter.removeOne(p.nombre, state)),
  on(actions.setCiudades, (state: EntityState<Ciudad>, p: { ciudades: Ciudad[] }): EntityState<Ciudad> => adapter.setAll(p.ciudades, state)),

  on(actions.updatePopulation, (state: EntityState<Ciudad>, p: { name: string, population: number }): EntityState<Ciudad> => adapter.mapOne({ id: p.name, map: ciudad => ({ ...ciudad, population: p.population }) }, state)),
  on(actions.updateBusiness, (state: EntityState<Ciudad>, p: { name: string, index: number, business: string, size: number }): EntityState<Ciudad> => adapter.mapOne({
    id: p.name, map: ciudad => ({
      ...ciudad,
      businesses: (businesses => {
        businesses[p.index] = { business: p.business, size: p.size };
        return businesses;
      })([...ciudad.businesses ?? []])
    })
  }, state)),

);

// NgRx selectors

const selectFeature = createFeatureSelector<EntityState<Ciudad>>(CIUDADES_FEATURE_KEY);

const {
  selectIds,
  selectAll,
} = adapter.getSelectors();

export const allCityKeys = createSelector(selectFeature, selectIds)
export const todosLosCiudades = createSelector(selectFeature, selectAll);
export const ciudad = (name: string) => createSelector(selectFeature, (feature) => feature.entities[name]);

// NgRx effects

const ciudadesChangedEffect = createEffect(
  (
    actions$ = inject(Actions),
  ) => actions$.pipe(
    ofType(
      actions.addCiudad,
      actions.removeCiudad,
      actions.updatePopulation,
      actions.updateBusiness,
    ),
    map(() => actions.persistCiudades()),
  ),
  { functional: true }
);

const persistCiudadesEffect = createEffect(
  (
    actions$ = inject(Actions),
    store = inject(Store),
  ) => actions$.pipe(
    ofType(actions.persistCiudades),
    switchMap(() => store.select(todosLosCiudades).pipe(take(1))),
    tap(ciudades => localStorage.setItem('ciudades', JSON.stringify(ciudades))),
  ),
  { functional: true, dispatch: false }
);

const loadCiudadesEffect = createEffect(
  (actions$ = inject(Actions)) => actions$.pipe(
    ofType(actions.loadCiudades),
    map(() => actions.setCiudades({ ciudades: JSON.parse(localStorage.getItem('ciudades') as string ?? '[]') })),
  ),
  { functional: true }
);

const ciudadesEffects = {
  ciudadesChangedEffect,
  persistCiudadesEffect,
  loadCiudadesEffect,
}

// Angular module

@NgModule({
  imports: [
    IndustriasNgrxModule,
    StoreModule.forFeature(CIUDADES_FEATURE_KEY, CIUDAD_REDUCER),
    EffectsModule.forFeature(ciudadesEffects)
  ]
})
export class CiudadesNgrxModule {
  constructor(store: Store) {
    console.log('CiudadesNgrxModule initializing');
    store.dispatch(loadCiudades());
  }
}
