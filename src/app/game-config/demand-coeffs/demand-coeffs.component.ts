import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, map } from 'rxjs';
import { Store } from '@ngrx/store';

import { Good, GoodsNgrxModule, allGoods } from '../ngrx/goods.ngrx';
import { DemandsNgrxModule, demand, upsertDemand } from '../ngrx/demands.ngrx';

type VM = {
  good: string,
  minCitySize?: number,
  wagonsPerMillion?: number,
};

@Component({
  selector: 'app-demand-coeffs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GoodsNgrxModule,
    DemandsNgrxModule,
  ],
  templateUrl: './demand-coeffs.component.html',
  styleUrl: './demand-coeffs.component.scss'
})
export class DemandCoeffsComponent {

  goods$: Observable<Good[]>;

  constructor(private store: Store) {
    this.goods$ = store.select(allGoods);
  }

  item$(good: Good) {
    return this.store.select(demand(good)).pipe(map(demand => ({
      good: good,
      minCitySize: demand?.minCitySize,
      wagonsPerMillion: demand?.wagonsPerMillion
    } satisfies VM)));
  }

  setMinCitySize(item: VM, minCitySize: number) {
    this.store.dispatch(upsertDemand({
      demand: {
        good: item.good,
        minCitySize,
        wagonsPerMillion: item.wagonsPerMillion ?? 0,
      }
    }));
  }

  setDemand(item: VM, wagonsPerMillion: number) {
    this.store.dispatch(upsertDemand({
      demand: {
        good: item.good,
        minCitySize: item.minCitySize ?? 0,
        wagonsPerMillion,
      }
    }));
  }
}
