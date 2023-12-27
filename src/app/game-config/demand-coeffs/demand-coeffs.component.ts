import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, combineLatest, map } from 'rxjs';
import { Store } from '@ngrx/store';

import { Good, GoodsNgrxModule, allGoods } from '../ngrx/goods.ngrx';
import { DemandsNgrxModule, allDemands, upsertDemand } from '../ngrx/demands.ngrx';

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

  items$: Observable<VM[]>;

  constructor(private store: Store) {
    this.items$ = combineLatest([
      store.select(allGoods),
      store.select(allDemands)
    ]).pipe(map(([goods, demands]) => {
      return goods.map(good => {
        const demand = demands.find(demand => demand.good === good);
        return {
          good: good,
          minCitySize: demand?.minCitySize,
          wagonsPerMillion: demand?.wagonsPerMillion
        } satisfies VM;
      })
    }));
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
