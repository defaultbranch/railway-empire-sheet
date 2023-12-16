import { ApplicationConfig, importProvidersFrom, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { CIUDADES_FEATURE_KEY } from './ciudades';
import { CIUDAD_REDUCER } from './ciudades';
import { ciudadesEffects } from './ciudades';
import { GOODS_FEATURE_KEY } from './goods';
import { goodsEffects } from './goods';
import { GOOD_REDUCER } from './goods';
import { NEGOCIOS_RURALES_FEATURE_KEY } from './negocios-rurales';
import { NEGOCIOS_RURALES_REDUCER } from './negocios-rurales';
import { negociosRuralesEffects } from './negocios-rurales';
import { GAME_DATE_FEATURE_KEY } from './game-date';
import { GAME_DATE_REDUCER } from './game-date';
import { gameDateEffects } from './game-date';
import { INDUSTRIAS_FEATURE_KEY } from './industrias';
import { INDUSTRIAS_REDUCER } from './industrias';
import { industriasEffects } from './industrias';
import { DIRECT_LINES_FEATURE_KEY } from './direct-lines';
import { DIRECT_LINES_REDUCER } from './direct-lines';
import { directLinesEffects } from './direct-lines';
import { NEGOCIOS_FEATURE_KEY } from './negocios';
import { NEGOCIOS_REDUCER } from './negocios';
import { negociosEffects } from './negocios';
import { PROVIDER_CONNECTIONS_FEATURE_KEY } from './provider-connections';
import { PROVIDER_CONNECTIONS_REDUCER } from './provider-connections';
import { providerConnectionsEffects } from './provider-connections';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(
      StoreModule.forRoot(),
      StoreModule.forFeature(GOODS_FEATURE_KEY, GOOD_REDUCER),
      StoreModule.forFeature(NEGOCIOS_FEATURE_KEY, NEGOCIOS_REDUCER),
      StoreModule.forFeature(INDUSTRIAS_FEATURE_KEY, INDUSTRIAS_REDUCER),
      StoreModule.forFeature(CIUDADES_FEATURE_KEY, CIUDAD_REDUCER),
      StoreModule.forFeature(NEGOCIOS_RURALES_FEATURE_KEY, NEGOCIOS_RURALES_REDUCER),
      StoreModule.forFeature(GAME_DATE_FEATURE_KEY, GAME_DATE_REDUCER),
      StoreModule.forFeature(PROVIDER_CONNECTIONS_FEATURE_KEY, PROVIDER_CONNECTIONS_REDUCER),
      StoreModule.forFeature(DIRECT_LINES_FEATURE_KEY, DIRECT_LINES_REDUCER),
      EffectsModule.forRoot(),
      EffectsModule.forFeature(goodsEffects),
      EffectsModule.forFeature(negociosEffects),
      EffectsModule.forFeature(industriasEffects),
      EffectsModule.forFeature(ciudadesEffects),
      EffectsModule.forFeature(negociosRuralesEffects),
      EffectsModule.forFeature(gameDateEffects),
      EffectsModule.forFeature(providerConnectionsEffects),
      EffectsModule.forFeature(directLinesEffects),
      StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !isDevMode() }),
    ),
  ]
};
