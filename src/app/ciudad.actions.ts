import { createActionGroup, emptyProps, props } from "@ngrx/store";
import { Ciudad } from "./ciudad";

export const CIUDADES_FEATURE_KEY = 'ciudades';

export const actions = createActionGroup({
  source: CIUDADES_FEATURE_KEY,
  events: {

    addCiudad: props<({ ciudad: Ciudad })>(),
    removeCiudad: props<({ nombre: string })>(),
    setCiudades: props<{ ciudades: Ciudad[] }>(),

    updatePopulation: props<({ name: string, population: number })>(),

    persistCiudades: emptyProps(),
    loadCiudades: emptyProps(),
  }
})

// public actions

export const {
  addCiudad,
  removeCiudad,
  loadCiudades,
  updatePopulation,
} = actions;
