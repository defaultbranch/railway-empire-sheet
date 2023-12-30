import { createSelector } from "@ngrx/store";

import { Good } from '../../game-config/ngrx/goods.ngrx';
import { negocioRuralByNameAndProduct } from './negocios-rurales.ngrx';
import { negocioProductionPerWeek } from '../../game-config/ngrx/negocios.ngrx';

export const productionPerWeek = (
  producerName: string,
  good: Good
) => createSelector(
  negocioRuralByNameAndProduct(producerName, good),
  negocioProductionPerWeek(good, good),
  (rural, perWeek) => rural ? perWeek ? perWeek[rural.size - 1] : 0 : 0
);
