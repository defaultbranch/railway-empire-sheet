import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, combineLatest, map } from 'rxjs';
import { Store } from '@ngrx/store';

import { Good, GoodsNgrxModule, allGoods } from '../ngrx/goods.ngrx';
import { DemandsNgrxModule, allDemands, upsertDemand } from '../ngrx/demands.ngrx';

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

  items$: Observable<{
    good: string,
    wagonsPerMillion?: number,
  }[]>;

  constructor(private store: Store) {
    this.items$ = combineLatest([
      store.select(allGoods),
      store.select(allDemands)
    ]).pipe(map(([goods, demands]) => {
      return goods.map(good => {
        const demand = demands.find(demand => demand.good === good);
        return {
          good: good,
          wagonsPerMillion: demand?.wagonsPerMillion
        };
      })
    }));
  }

  setDemand(good: Good, wagonsPerMillion: number) {
    this.store.dispatch(upsertDemand({ demand: { good, wagonsPerMillion } }));
  }
}
