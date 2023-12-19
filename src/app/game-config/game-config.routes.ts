import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'goods', loadComponent: () => import('./goods-table/goods-table.component').then(c => c.GoodsTableComponent) },
  { path: 'negocios', loadComponent: () => import('./negocios-table/negocios-table.component').then(c => c.NegociosTableComponent) },
  { path: 'industrias', loadComponent: () => import('./industrias-table/industrias-table.component').then(c => c.IndustriasTableComponent) },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class GameConfigurationRoutesModule {
  constructor() {
    console.log('GameConfigurationRoutesModule initializing');
  }
 }
