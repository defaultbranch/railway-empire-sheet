import { EntityState, createEntityAdapter } from "@ngrx/entity";
import { createFeatureSelector, createReducer, createSelector, on } from "@ngrx/store";

import { GOODS_FEATURE_KEY, actions } from "./goods.actions";

export const goodsAdapter = createEntityAdapter<string>({ selectId: good => good });

export const GOOD_REDUCER = createReducer(

  goodsAdapter.getInitialState(),

  on(actions.addGood, (state: EntityState<string>, p: { good: string }): EntityState<string> => goodsAdapter.addOne(p.good, state)),
  on(actions.removeGood, (state: EntityState<string>, p: { good: string }): EntityState<string> => goodsAdapter.removeOne(p.good, state)),
  on(actions.setGoods, (state: EntityState<string>, p: { goods: string[] }): EntityState<string> => goodsAdapter.setAll(p.goods, state)),
);

// selectors

const selectGoodsFeature = createFeatureSelector<EntityState<string>>(GOODS_FEATURE_KEY);

const {
  selectAll,
} = goodsAdapter.getSelectors();

export const allGoods = createSelector(selectGoodsFeature, selectAll);
