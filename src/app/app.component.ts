import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';

import { GameDateComponent } from "./game-date/game-date.component";
import { loadGameDate } from './game-date';
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
    store.dispatch(loadGameDate());
    store.dispatch(loadProviderConnections());
    store.dispatch(loadDirectLines());
  }
}
