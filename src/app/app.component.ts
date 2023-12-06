import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';

import { CiudadesTableComponent } from "./ciudades-table/ciudades-table.component";
import { actions } from './ciudad.actions';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [
    CommonModule,
    RouterOutlet,
    CiudadesTableComponent
  ]
})
export class AppComponent {

  constructor(store: Store) {
    store.dispatch(actions.loadCiudades());
  }
}
