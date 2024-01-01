import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable, combineLatest, concatMap, from, map, switchMap, toArray } from 'rxjs';
import { Store } from '@ngrx/store';

import { Good, GoodsNgrxModule, allGoods } from '../../game-config/ngrx/goods.ngrx';
import { CiudadesNgrxModule, allCityKeys } from '../ngrx/ciudades.ngrx';
import { cityDemandPerWeek } from '../ngrx/computations';
import { DemandsNgrxModule } from '../../game-config/ngrx/demands.ngrx';
import { IndustriasNgrxModule } from '../../game-config/ngrx/industrias.ngrx';
import { sortObservableStream } from '../util';

type VM = {
  city: string,
  good: Good,
};

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

  keys$: Observable<VM[]>;
  keysSorted$: Observable<VM[]>;

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
    );
    this.keysSorted$ = this.keys$;
  }

  readonly demandPerWeek$ = (key: VM) => this.store.select(cityDemandPerWeek(key.city, key.good));

  sortByDemandDesc() {
    this.keysSorted$ = this.itemsSorted(
      this.demandPerWeek$,
      (a, b) => b - a
    );
  }

  private itemsSorted<C>(
    lookup: (item: VM) => Observable<C>,
    compare: (a: C, b: C) => number,
  ) {
    return sortObservableStream(this.keys$, lookup, compare);
  }

}
