import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Observable, combineLatest, concatMap, from, map, reduce, switchMap, take, toArray } from 'rxjs';
import { Store } from '@ngrx/store';

import { Good, allGoods } from '../../game-config/ngrx/goods.ngrx';
import { allCityKeys } from '../ngrx/ciudades.ngrx';
import { cityDemandPerWeek, providerEffectiveRate } from '../ngrx/computations';
import { DemandsNgrxModule } from '../../game-config/ngrx/demands.ngrx';
import { filteredObservableStream, sortObservableStream } from '../util';
import { ProviderConnectionsNgrxModule, providersForCityAndGood } from '../ngrx/provider-connections.ngrx';

type VM = {
  city: string,
  good: Good,
};

@Component({
  selector: 'app-cities-demand-supply',
  standalone: true,
  imports: [
    CommonModule,
    DemandsNgrxModule,
    ProviderConnectionsNgrxModule,
  ],
  templateUrl: './cities-demand-supply.component.html',
  styleUrl: './cities-demand-supply.component.scss'
})
export class CitiesDemandSupplyComponent {

  keys$: Observable<VM[]>;
  keysSorted$: Observable<VM[]>;

  constructor(private store: Store) {

    const keys$ = combineLatest([
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
    this.keys$ = filteredObservableStream(keys$, this.demandPerWeek$, demand => demand > 0);
    this.keysSorted$ = this.keys$;
  }

  readonly demandPerWeek$ = (key: VM) => this.store.select(cityDemandPerWeek(key.city, key.good));
  readonly effectiveRate$ = (key: VM) => this.store.select(providersForCityAndGood(key.city, key.good)).pipe(
    switchMap(providers => from(providers).pipe(
      concatMap(provider => this.store.select(providerEffectiveRate(provider)).pipe(take(1))),
      reduce((total, value) => total + (value ?? 0), 0),
    ))
  );

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
