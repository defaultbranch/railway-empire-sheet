import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';

import { CiudadesTableComponent } from "./ciudades-table/ciudades-table.component";
import { loadCiudades } from './ciudad.actions';
import { GoodsTableComponent } from "./goods-table/goods-table.component";
import { loadGoods } from './goods.actions';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [
    CommonModule,
    RouterOutlet,
    CiudadesTableComponent,
    GoodsTableComponent,
  ]
})
export class AppComponent {

  constructor(store: Store) {
    store.dispatch(loadCiudades());
    store.dispatch(loadGoods());
  }
}
