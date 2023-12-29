import { createSelector } from "@ngrx/store";

import { Good } from '../../game-config/ngrx/goods.ngrx';
import { negocioRuralByNameAndProduct } from './negocios-rurales.ngrx';
import { todosLosNegocios } from '../../game-config/ngrx/negocios.ngrx';
import { ruralProductionPerWeek } from '../util';

export const productionPerWeek = (
  producerName: string,
  good: Good
) => createSelector(
  negocioRuralByNameAndProduct(producerName, good),
  todosLosNegocios,
  (rural, negocios) => rural ? ruralProductionPerWeek(rural, negocios) : 0
);
