import { ApplicationConfig, importProvidersFrom, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { CIUDADES_FEATURE_KEY } from './ciudad.actions';
import { CIUDAD_REDUCER } from './ciudad.state';
import { ciudadesEffects } from './ciudad.effects';
import { GOODS_FEATURE_KEY } from './goods.actions';
import { goodsEffects } from './goods.effects';
import { GOOD_REDUCER } from './goods.state';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(
      StoreModule.forRoot(),
      StoreModule.forFeature(CIUDADES_FEATURE_KEY, CIUDAD_REDUCER),
      StoreModule.forFeature(GOODS_FEATURE_KEY, GOOD_REDUCER),
      EffectsModule.forRoot(),
      EffectsModule.forFeature(ciudadesEffects),
      EffectsModule.forFeature(goodsEffects),
      StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !isDevMode() }),
    ),
  ]
};
