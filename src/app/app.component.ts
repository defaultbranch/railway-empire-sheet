import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';

import { loadCiudades } from './ciudad.actions';
import { loadGoods } from './goods.actions';
import { loadNegociosRurales } from './negocio-rural.actions';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    imports: [
        CommonModule,
        RouterOutlet,
        RouterLink,
    ]
})
export class AppComponent {

  constructor(store: Store) {
    store.dispatch(loadCiudades());
    store.dispatch(loadGoods());
    store.dispatch(loadNegociosRurales());
  }
}
