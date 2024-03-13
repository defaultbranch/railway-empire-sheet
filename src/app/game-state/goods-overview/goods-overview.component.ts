import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, combineLatest, map, switchMap } from 'rxjs';
import { Store, createSelector } from '@ngrx/store';

import { Good, allGoods } from '../../game-config/ngrx/goods.ngrx';
import { CiudadesNgrxModule, allCityKeys } from '../ngrx/ciudades.ngrx';
import { NegociosRuralesNgrxModule, allLocalBusinessKeys } from '../ngrx/negocios-rurales.ngrx';
import { businessDemandPerWeek, citizenDemandPerWeek } from '../ngrx/computations';
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

  goods$: Observable<Good[]>;
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

  totalSupply$(good: Good): Observable<number> {
    return this.computationService.totalSupply$(good)
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
