import { Routes } from '@angular/router';

export const routes: Routes = [

  { path: 'game-config', loadChildren: () => import('./game-config/game-config.routes').then(m => m.GameConfigurationRoutesModule) },

  { path: 'ciudades', loadComponent: () => import('./ciudades-table/ciudades-table.component').then(c => c.CiudadesTableComponent) },
  { path: 'rurales', loadComponent: () => import('./negocios-rurales-table/negocios-rurales-table.component').then(c => c.NegociosRuralesTableComponent) },
  { path: 'direct-lines', loadComponent: () => import('./direct-lines/direct-lines.component').then(c => c.DirectLinesComponent) },

  { path: 'ciudad', loadComponent: () => import('./ciudad/ciudad.component').then(c => c.CiudadComponent) },
];
