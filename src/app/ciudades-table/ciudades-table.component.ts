import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';

import { Ciudad } from '../ciudad';
import { addCiudad } from '../ciudad.actions';

@Component({
  selector: 'app-ciudades-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './ciudades-table.component.html',
  styleUrl: './ciudades-table.component.scss'
})
export class CiudadesTableComponent {

  ciudades: Ciudad[] = [];

  newName?: string;
  newSize?: number;
  newPopulation?: number;

  constructor(private store: Store) { }

  addCity(p: { name: string, size: number, population: number }) {
    this.store.dispatch(addCiudad({ ciudad: { name: p.name, size: p.size, population: p.population } }));
  }
}
