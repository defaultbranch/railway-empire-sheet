import { ApplicationConfig, importProvidersFrom, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { StoreModule } from '@ngrx/store';

import { routes } from './app.routes';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(
      StoreModule.forRoot(),
      StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !isDevMode() }),
    ),
  ]
};
