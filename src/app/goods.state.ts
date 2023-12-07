import { EntityState, createEntityAdapter } from "@ngrx/entity";
import { createFeatureSelector, createReducer, createSelector, on } from "@ngrx/store";

import { GOODS_FEATURE_KEY, actions } from "./goods.actions";

const adapter = createEntityAdapter<string>({ selectId: good => good });

export const GOOD_REDUCER = createReducer(

  adapter.getInitialState(),

  on(actions.addGood, (state: EntityState<string>, p: { good: string }): EntityState<string> => adapter.addOne(p.good, state)),
  on(actions.removeGood, (state: EntityState<string>, p: { good: string }): EntityState<string> => adapter.removeOne(p.good, state)),
  on(actions.setGoods, (state: EntityState<string>, p: { goods: string[] }): EntityState<string> => adapter.setAll(p.goods, state)),
);

// selectors

const selectFeature = createFeatureSelector<EntityState<string>>(GOODS_FEATURE_KEY);

const {
  selectAll,
} = adapter.getSelectors();

export const allGoods = createSelector(selectFeature, selectAll);
