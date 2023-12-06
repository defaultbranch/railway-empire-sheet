import { ApplicationConfig, importProvidersFrom, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { StoreModule } from '@ngrx/store';

import { routes } from './app.routes';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { CIUDADES_FEATURE_KEY } from './ciudad.actions';
import { CIUDAD_REDUCER } from './ciudad.state';
import { EffectsModule } from '@ngrx/effects';
import { ciudadesEffects } from './ciudad.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(
      StoreModule.forRoot(),
      StoreModule.forFeature(CIUDADES_FEATURE_KEY, CIUDAD_REDUCER),
      EffectsModule.forRoot(),
      EffectsModule.forFeature(ciudadesEffects),
      StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !isDevMode() }),
    ),
  ]
};
