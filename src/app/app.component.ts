import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Store, StoreModule } from '@ngrx/store';

import { GameDateComponent } from "./game-date/game-date.component";
import { loadDirectLines } from './direct-lines';
import { loadProviderConnections } from './provider-connections';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    imports: [
        CommonModule,
        RouterOutlet,
        RouterLink,
        GameDateComponent,
    ]
})
export class AppComponent {

  constructor(store: Store) {
    store.dispatch(loadProviderConnections());
    store.dispatch(loadDirectLines());
  }
}
