import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, map, switchMap, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';

import { Ciudad } from '../ngrx/ciudades.ngrx';
import { ciudad } from '../ngrx/ciudades.ngrx';
import { updateBusiness, updatePerWeek, updatePopulation } from '../ngrx/ciudades.ngrx';
import { allIndustrieNames } from '../game-config/ngrx/industrias.ngrx';
import { allGoods } from '../game-config/ngrx/goods.ngrx';
import { DirectCityProviderComponent } from './direct-city-provider/direct-city-provider.component';

@Component({
  selector: 'app-ciudad',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DirectCityProviderComponent,
  ],
  templateUrl: './ciudad.component.html',
  styleUrl: './ciudad.component.scss'
})
export class CiudadComponent implements OnDestroy {

  ciudad$: Observable<Ciudad | undefined>;
  industrias$: Observable<string[]>;
  goods$: Observable<string[]>;

  private disposing$ = new Subject<void>();

  constructor(
    private store: Store,
    route: ActivatedRoute,
  ) {
    this.ciudad$ = route.queryParams.pipe(
      map(it => it['name']),
      switchMap(name => store.select(ciudad(name))),
      takeUntil(this.disposing$)
    );
    this.industrias$ = store.select(allIndustrieNames);
    this.goods$ = store.select(allGoods);
  }

  ngOnDestroy(): void {
    this.disposing$.next(void 0);
  }

  updatePopulation(p: { name: string, population: number }) {
    this.store.dispatch(updatePopulation({ name: p.name, population: p.population }));
  }

  updateBusiness(p: { name: string, index: number, business: string | undefined, size: number | undefined }) {
    if (p.index >= 0 && p.index <= 3 && !!p.business && !!p.size && p.size >= 1 && p.size <= 5) {
      this.store.dispatch(updateBusiness({ name: p.name, index: p.index, business: p.business, size: p.size }));
    }
  }

  updatePerWeek(p: { name: string, good: string, perWeek: number }) {
    this.store.dispatch(updatePerWeek({ name: p.name, good: p.good, perWeek: p.perWeek }));

  }
}
