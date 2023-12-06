import { createActionGroup, emptyProps, props } from "@ngrx/store";

export const GOODS_FEATURE_KEY = 'goods';

export const actions = createActionGroup({
  source: GOODS_FEATURE_KEY,
  events: {

    addGood: props<({ good: string })>(),
    removeGood: props<({ good: string })>(),
    setGoods: props<{ goods: string[] }>(),

    persistGoods: emptyProps(),
    loadGoods: emptyProps(),
  }
})

// public actions

export const {
  addGood,
  removeGood,
  loadGoods,
} = actions;
