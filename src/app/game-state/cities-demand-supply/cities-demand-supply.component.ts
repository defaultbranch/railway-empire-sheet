import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable, combineLatest, concatMap, from, map, switchMap, tap, toArray } from 'rxjs';
import { Store } from '@ngrx/store';

import { Good, GoodsNgrxModule, allGoods } from '../../game-config/ngrx/goods.ngrx';
import { CiudadesNgrxModule, allCityKeys } from '../ngrx/ciudades.ngrx';
import { cityDemandPerWeek } from '../ngrx/computations';
import { DemandsNgrxModule } from '../../game-config/ngrx/demands.ngrx';
import { IndustriasNgrxModule } from '../../game-config/ngrx/industrias.ngrx';

@Component({
  selector: 'app-cities-demand-supply',
  standalone: true,
  imports: [
    CommonModule,
    CiudadesNgrxModule,
    GoodsNgrxModule,
    DemandsNgrxModule,
    IndustriasNgrxModule,
  ],
  templateUrl: './cities-demand-supply.component.html',
  styleUrl: './cities-demand-supply.component.scss'
})
export class CitiesDemandSupplyComponent {

  keys$: Observable<{
    city: string,
    good: Good,
  }[]>;

  constructor(private store: Store) {

    this.keys$ = combineLatest([
      store.select(allCityKeys),
      store.select(allGoods),
    ]).pipe(
      switchMap(([cities, goods]) =>
        from(cities).pipe(
          concatMap(city => from(goods).pipe(
            map(good => ({ city, good })),
          )),
          toArray()
        )),
    )
  }

  readonly demandPerWeek$ = (city: string, good: Good) => this.store.select(cityDemandPerWeek(city, good));
}
