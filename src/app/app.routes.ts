import { Routes } from '@angular/router';

export const routes: Routes = [

  { path: 'goods', loadComponent: () => import('./goods-table/goods-table.component').then(c => c.GoodsTableComponent) },
  { path: 'negocios', loadComponent: () => import('./negocios-table/negocios-table.component').then(c => c.NegociosTableComponent) },
  { path: 'industrias', loadComponent: () => import('./industrias-table/industrias-table.component').then(c => c.IndustriasTableComponent) },
  { path: 'ciudades', loadComponent: () => import('./ciudades-table/ciudades-table.component').then(c => c.CiudadesTableComponent) },
  { path: 'rurales', loadComponent: () => import('./negocios-rurales-table/negocios-rurales-table.component').then(c => c.NegociosRuralesTableComponent) },
  { path: 'direct-lines', loadComponent: () => import('./direct-lines/direct-lines.component').then(c => c.DirectLinesComponent) },

  { path: 'ciudad', loadComponent: () => import('./ciudad/ciudad.component').then(c => c.CiudadComponent) },
];
