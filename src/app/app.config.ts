import { ApplicationConfig, importProvidersFrom, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { CiudadesNgrxModule } from './ngrx/ciudades.ngrx';
import { GoodsNgrxModule } from './ngrx/goods.ngrx';
import { NegociosRuralesNgrxModule } from './ngrx/negocios-rurales.ngrx';
import { GameDateNgrxModule } from './ngrx/game-date.ngrx';
import { IndustriasNgrxModule } from './ngrx/industrias.ngrx';
import { DirectLinesNgrxModule } from './ngrx/direct-lines.ngrx';
import { NegociosNgrxModule } from './ngrx/negocios.ngrx';
import { ProviderConnectionsNgrxModule } from './ngrx/provider-connections.ngrx';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(
      StoreModule.forRoot(),
      GoodsNgrxModule,
      NegociosNgrxModule,
      IndustriasNgrxModule,
      CiudadesNgrxModule,
      NegociosRuralesNgrxModule,
      GameDateNgrxModule,
      ProviderConnectionsNgrxModule,
      DirectLinesNgrxModule,
      EffectsModule.forRoot(),
      StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !isDevMode() }),
    ),
  ]
};
