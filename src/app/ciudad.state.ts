import { EntityState, createEntityAdapter } from "@ngrx/entity";
import { Ciudad } from "./ciudad";
import { actions } from "./ciudad.actions";
import { createReducer, on } from "@ngrx/store";

export const ciudadAdapter = createEntityAdapter<Ciudad>({ selectId: ciudad => ciudad.name });

export const CIUDAD_REDUCER = createReducer(

  ciudadAdapter.getInitialState(),

  on(actions.addCiudad, (state: EntityState<Ciudad>, p: { ciudad: Ciudad }): EntityState<Ciudad> => ciudadAdapter.addOne(p.ciudad, state))
);
