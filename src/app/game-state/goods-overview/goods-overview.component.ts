import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, combineLatest, concatMap, from, map, switchMap } from 'rxjs';
import { Store, createSelector } from '@ngrx/store';

import { Good, GoodsNgrxModule, allGoods } from '../../game-config/ngrx/goods.ngrx';
import { Ciudad, CiudadesNgrxModule, allCityKeys, todosLosCiudades } from '../ngrx/ciudades.ngrx';
import { NegocioRural, NegociosRuralesNgrxModule, allLocalBusinessKeys, todosLosNegociosRurales } from '../ngrx/negocios-rurales.ngrx';
import { businessDemandPerWeek, businessProductionPerWeek, citizenDemandPerWeek, ruralProductionPerWeek } from '../ngrx/computations';
import { IndustriasNgrxModule } from '../../game-config/ngrx/industrias.ngrx';
import { DemandsNgrxModule } from '../../game-config/ngrx/demands.ngrx';
import { NegociosNgrxModule, allNegocioKeys } from '../../game-config/ngrx/negocios.ngrx';

@Component({
  selector: 'app-goods-overview',
  standalone: true,
  imports: [
    CommonModule,
    CiudadesNgrxModule,
    DemandsNgrxModule,
    IndustriasNgrxModule,
    NegociosRuralesNgrxModule,
  ],
  templateUrl: './goods-overview.component.html',
  styleUrl: './goods-overview.component.scss'
})
export class GoodsOverviewComponent {

  goods$: Observable<Good[]>;
  cities$: Observable<string[]>;
  rurales$: Observable<string[]>;

  constructor(private store: Store) {
    this.goods$ = store.select(allGoods);
    this.cities$ = store.select(allCityKeys);
    this.rurales$ = store.select(allLocalBusinessKeys);
  }

  totalSupply$(good: Good): Observable<number> {

    const citiesProduction$ = this.cities$.pipe(
      switchMap(cities => combineLatest(
        cities.map(city =>
          this.store.select(businessProductionPerWeek(city, good))
        )
      )),
      map(values => values.reduceRight((a, b) => a + b))
    );

    const ruralesProduction$ = this.rurales$.pipe(
      switchMap(rurales => combineLatest(
        rurales.map(rural =>
          this.store.select(ruralProductionPerWeek(rural, good)))
      )),
      map(values => values.reduceRight((a, b) => a + b))
    );

    return combineLatest([citiesProduction$, ruralesProduction$]).pipe(
      map(([a, b]) => a+b)
    );
  }

  totalDemand$(good: Good): Observable<number> {
    return this.cities$.pipe(
      switchMap(cities => combineLatest(
        cities.map(city =>
          this.store.select(cityDemandPerWeek(city, good))
        )
      )),
      map(values => values.reduceRight((a, b) => a + b))
    )
  }
}

const cityDemandPerWeek = (
  city: string,
  good: Good,
) => createSelector(
  businessDemandPerWeek(city, good),
  citizenDemandPerWeek(city, good),
  (a, b) => a + b
);
