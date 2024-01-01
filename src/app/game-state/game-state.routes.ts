import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [

  { path: 'ciudades', loadComponent: () => import('./ciudades-table/ciudades-table.component').then(c => c.CiudadesTableComponent) },
  { path: 'rurales', loadComponent: () => import('./negocios-rurales-table/negocios-rurales-table.component').then(c => c.NegociosRuralesTableComponent) },
  { path: 'direct-lines', loadComponent: () => import('./direct-lines/direct-lines.component').then(c => c.DirectLinesComponent) },
  { path: 'cities-demand-supply', loadComponent: () => import('./cities-demand-supply/cities-demand-supply.component').then(c => c.CitiesDemandSupplyComponent) },

  { path: 'ciudad', loadComponent: () => import('./ciudad/ciudad.component').then(c => c.CiudadComponent) },
  { path: 'negocio-rural', loadComponent: () => import('./negocio-rural/negocio-rural.component').then(c => c.NegocioRuralComponent) },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class GameStateRoutesModule {
  constructor() {
    console.log('GameStateRoutesModule initializing');
  }
}
