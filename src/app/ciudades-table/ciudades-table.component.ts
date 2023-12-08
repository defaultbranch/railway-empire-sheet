import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, map } from 'rxjs';
import { Store } from '@ngrx/store';

import { Ciudad } from '../ciudad';
import { addCiudad, removeCiudad, updatePopulation } from '../ciudad.actions';
import { todosLosCiudades } from '../ciudad.state';
import { allIndustries } from '../industrias.state';

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

  ciudades$: Observable<Ciudad[]>;
  ciudadesSorted$: Observable<Ciudad[]>;
  industrias$: Observable<string[]>;

  newName?: string;
  newSize?: number;
  newPopulation?: number;

  constructor(private store: Store) {
    this.ciudades$ = store.select(todosLosCiudades);
    this.ciudadesSorted$ = this.ciudades$;
    this.industrias$ = store.select(allIndustries);
  }

  addCity(p: { name: string, size: number, population: number }) {
    this.store.dispatch(addCiudad({ ciudad: { name: p.name, size: p.size, population: p.population } }));
  }

  updatePopulation(p: { name: string, population: number }) {
    this.store.dispatch(updatePopulation({ name: p.name, population: p.population }));
  }

  removeCity(name: string) {
    this.store.dispatch(removeCiudad({ nombre: name }));
  }

  sortByName() {
    this.ciudadesSorted$ = this.ciudades$.pipe(map(it => it.sort((a, b) => a.name.localeCompare(b.name))));
  }

  sortByPopulation() {
    this.ciudadesSorted$ = this.ciudades$.pipe(map(it => it.sort((a, b) => b.population - a.population)));
  }
}
