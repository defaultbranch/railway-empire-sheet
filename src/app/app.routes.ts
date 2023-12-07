import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'ciudades', loadComponent: () => import('./ciudades-table/ciudades-table.component').then(c => c.CiudadesTableComponent) },
  { path: 'goods', loadComponent: () => import('./goods-table/goods-table.component').then(c => c.GoodsTableComponent) },
  { path: 'rurales', loadComponent: () => import('./negocios-rurales-table/negocios-rurales-table.component').then(c => c.NegociosRuralesTableComponent) },
];
