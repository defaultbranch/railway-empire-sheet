import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';

import { loadCiudades } from './ciudad.actions';
import { loadGoods } from './goods.actions';
import { loadNegociosRurales } from './negocio-rural.actions';
import { GameDateComponent } from "./game-date/game-date.component";
import { loadGameDate } from './game-date.actions';
import { loadIndustrias } from './industrias.actions';
import { loadDirectLines } from './direct-lines.actions';

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
    store.dispatch(loadCiudades());
    store.dispatch(loadGoods());
    store.dispatch(loadIndustrias());
    store.dispatch(loadNegociosRurales());
    store.dispatch(loadGameDate());
    store.dispatch(loadDirectLines());
  }
}
