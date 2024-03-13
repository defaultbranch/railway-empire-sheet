import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, combineLatest, map, of, switchMap } from 'rxjs';
import { Store, createSelector } from '@ngrx/store';

import { Good, allGoods } from '../../game-config/ngrx/goods.ngrx';
import { CiudadesNgrxModule, allCityKeys } from '../ngrx/ciudades.ngrx';
import { NegociosRuralesNgrxModule, allLocalBusinessKeys } from '../ngrx/negocios-rurales.ngrx';
import { businessDemandPerWeek, businessProductionPerWeek, citizenDemandPerWeek, cityDemandPerWeek, ruralProductionPerWeek } from '../ngrx/computations';
import { IndustriasNgrxModule } from '../../game-config/ngrx/industrias.ngrx';
import { DemandsNgrxModule } from '../../game-config/ngrx/demands.ngrx';
import { ComputationService } from '../ngrx/computation.service';

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

  // main
  goods$: Observable<Good[]>;

  // aux
  cities$: Observable<string[]>;
  rurales$: Observable<string[]>;

  constructor(
    private computationService: ComputationService,
    private store: Store
  ) {
    this.goods$ = store.select(allGoods);
    this.cities$ = store.select(allCityKeys);
    this.rurales$ = store.select(allLocalBusinessKeys);
  }

  sortByGood() {
    this.goods$ = this.store.select(allGoods);
  }

  sortByTotalSupply() {
    this.goods$ = this.computationService.goodsByTotalSupplyDesc$();
  }

  sortByTotalDemand() {
    this.goods$ = this.computationService.goodsByTotalDemandDesc$();
  }

  sortByTotalSupplyDemandRatio() {
    this.goods$ = this.computationService.goodsByTotalSupplyDemandRatio$();
  }

  totalSupply$(good: Good): Observable<number> {
    return this.computationService.totalSupply$(good);
  }

  totalDemand$(good: Good): Observable<number> {
    return this.computationService.totalDemand$(good);
  }

  totalSupplyDemandRatio$(good: Good): Observable<number> {
    return this.computationService.totalSupplyDemandRatio$(good);
  }

  producedInDesc$(good: Good): Observable<({ type: 'CITY', city: string, perWeek: number } | { type: 'RURAL', rural: string, perWeek: number })[]> {

    const cityProducers$ = this.cities$.pipe(
      switchMap(cities => combineLatest(
        cities
          .map(city => this.store.select(businessProductionPerWeek(city, good))
            .pipe(
              map(perWeek => ({ type: 'CITY', city, perWeek } as const))
            )
          )
      )),
      map(it => it.filter(it => it.perWeek > 0)),
      map(it => {
        it.sort((a, b) => {
          const amountDelta = b.perWeek - a.perWeek
          if (amountDelta) return amountDelta;
          return a.city.localeCompare(b.city);
        });
        return it;
      })
    );

    const ruralProducer$ = this.rurales$.pipe(
      switchMap(rurales => combineLatest(
        rurales
          .map(rural => this.store.select(ruralProductionPerWeek(rural, good))
            .pipe(
              map(perWeek => ({ type: 'RURAL', rural, perWeek } as const))
            )
          )
      )),
      map(it => it.filter(it => it.perWeek > 0)),
      map(it => {
        it.sort((a, b) => {
          const amountDelta = b.perWeek - a.perWeek
          if (amountDelta) return amountDelta;
          return a.rural.localeCompare(b.rural);
        });
        return it;
      })
    )

    return combineLatest([
      cityProducers$,
      ruralProducer$
    ], (a, b) => ([...a, ...b]))
  }
}
