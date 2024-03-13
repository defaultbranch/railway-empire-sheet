import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, combineLatest, map, switchMap } from 'rxjs';
import { Store, createSelector } from '@ngrx/store';

import { Good, allGoods } from '../../game-config/ngrx/goods.ngrx';
import { CiudadesNgrxModule, allCityKeys } from '../ngrx/ciudades.ngrx';
import { NegociosRuralesNgrxModule, allLocalBusinessKeys } from '../ngrx/negocios-rurales.ngrx';
import { businessDemandPerWeek, citizenDemandPerWeek, cityDemandPerWeek } from '../ngrx/computations';
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

  constructor(
    private computationService: ComputationService,
    store: Store
  ) {
    this.goods$ = store.select(allGoods);
  }

  totalSupply$(good: Good): Observable<number> {
    return this.computationService.totalSupply$(good);
  }

  totalDemand$(good: Good): Observable<number> {
    return this.computationService.totalDemand$(good);
  }
}
