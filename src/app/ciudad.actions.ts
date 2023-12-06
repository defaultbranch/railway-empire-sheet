import { createActionGroup, props } from "@ngrx/store";
import { Ciudad } from "./ciudad";

export const CIUDADES_FEATURE_KEY = 'ciudades';

export const actions = createActionGroup({
  source: CIUDADES_FEATURE_KEY,
  events: {
    addCiudad: props<({ ciudad: Ciudad })>(),
    removeCiudad: props<({ nombre: string })>(),
  }
})

// public actions

export const {
  addCiudad,
  removeCiudad,
} = actions;
