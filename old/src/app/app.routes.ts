import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'load-and-save', loadComponent: () => import('./load-and-save/load-and-save.component').then(c => c.LoadAndSaveComponent) },
  { path: 'game-config', loadChildren: () => import('./game-config/game-config.routes').then(m => m.GameConfigRoutesModule) },
  { path: 'game-state', loadChildren: () => import('./game-state/game-state.routes').then(m => m.GameStateRoutesModule) },
];
