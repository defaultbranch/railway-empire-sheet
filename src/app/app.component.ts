import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CiudadesTableComponent } from "./ciudades-table/ciudades-table.component";
import { Store } from '@ngrx/store';

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

  constructor(store: Store) { }
}
