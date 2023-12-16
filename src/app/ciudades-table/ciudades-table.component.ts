import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, map } from 'rxjs';
import { Store } from '@ngrx/store';

import { Ciudad } from '../ciudades';
import { addCiudad, removeCiudad, updateBusiness, updatePopulation } from '../ciudades';
import { todosLosCiudades } from '../ciudades';
import { allIndustrieNames } from '../industrias';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-ciudades-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
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
    this.industrias$ = store.select(allIndustrieNames);
  }

  addCity(p: { name: string, size: number, population: number }) {
    this.store.dispatch(addCiudad({ ciudad: { name: p.name, size: p.size, population: p.population } }));
  }

  updatePopulation(p: { name: string, population: number }) {
    this.store.dispatch(updatePopulation({ name: p.name, population: p.population }));
  }

  updateBusiness(p: { name: string, index: number, business: string | undefined, size: number | undefined }) {
    console.log(p);
    if (p.index >= 0 && p.index <= 3 && !!p.business && !!p.size && p.size >= 1 && p.size <= 5) {
      this.store.dispatch(updateBusiness({ name: p.name, index: p.index, business: p.business, size: p.size }));
    }
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
