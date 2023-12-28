import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable, combineLatest, map, take } from 'rxjs';
import { Store } from '@ngrx/store';

import { CiudadesNgrxModule, allCityKeys, ciudad } from '../ngrx/ciudades.ngrx';
import { addCiudad, removeCiudad, updateBusiness, updatePopulation } from '../ngrx/ciudades.ngrx';
import { todosLosCiudades } from '../ngrx/ciudades.ngrx';
import { allIndustryKeys } from '../../game-config/ngrx/industrias.ngrx';
import { GameDateComponent } from "../game-date/game-date.component";

@Component({
  selector: 'app-ciudades-table',
  standalone: true,
  templateUrl: './ciudades-table.component.html',
  styleUrl: './ciudades-table.component.scss',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    GameDateComponent,
    CiudadesNgrxModule,
  ]
})
export class CiudadesTableComponent {

  keys$: Observable<string[]>;
  keysSorted$: Observable<string[]>;

  industrias$: Observable<string[]>;

  newName?: string;
  newPopulation?: number;

  constructor(private store: Store) {

    this.keys$ = store.select(allCityKeys);
    this.keysSorted$ = this.keys$;

    this.industrias$ = store.select(allIndustryKeys);
  }

  ciudad$(key: string) {
    return this.store.select(ciudad(key));
  }

  addCity(p: { name: string, population: number }) {
    this.store.dispatch(addCiudad({ ciudad: { name: p.name, population: p.population, businesses: [,,] } }));
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
    this.keysSorted$ = combineLatest([
      this.keys$,
      this.store.select(todosLosCiudades).pipe(take(1))
    ], (keys, cities) => {
      return [...keys].sort((a, b) => {
        const aName = cities.find(it => it.name === a)?.name;
        const bName = cities.find(it => it.name === b)?.name;
        return aName ? bName ? aName.localeCompare(bName) : -1 : bName ? 1 : 0;
      })
    });
  }

  sortOnceByPopulationDesc() {
    this.keysSorted$ = combineLatest([
      this.keys$,
      this.store.select(todosLosCiudades).pipe(take(1))
    ], (keys, cities) => {
      return [...keys].sort((a, b) => {
        const aName = cities.find(it => it.name === a)?.population;
        const bName = cities.find(it => it.name === b)?.population;
        return -(aName ? bName ? aName - bName : -1 : bName ? 1 : 0);
      })
    });
  }
}
