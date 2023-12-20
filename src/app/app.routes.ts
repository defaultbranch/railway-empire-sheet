import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'game-config', loadChildren: () => import('./game-config/game-config.routes').then(m => m.GameConfigRoutesModule) },
  { path: 'game-state', loadChildren: () => import('./game-state/game-state.routes').then(m => m.GameStateRoutesModule) },
];
