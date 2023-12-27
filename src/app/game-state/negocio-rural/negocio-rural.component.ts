import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, map, switchMap, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';

import { NegocioRural, negocioRural, updateSize } from '../ngrx/negocios-rurales.ngrx';
import { GameDateComponent } from '../game-date/game-date.component';
import { ProviderConnectionsNgrxModule } from '../ngrx/provider-connections.ngrx';
import { DirectNegocioProviderComponent } from './direct-negocio-provider/direct-negocio-provider.component';

@Component({
  selector: 'app-negocio-rural',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProviderConnectionsNgrxModule,
    DirectNegocioProviderComponent,
    GameDateComponent
  ],
  templateUrl: './negocio-rural.component.html',
  styleUrl: './negocio-rural.component.scss'
})
export class NegocioRuralComponent implements OnDestroy {

  negocioRural$: Observable<NegocioRural | undefined>;

  private disposing$ = new Subject<void>();

  constructor(
    private store: Store,
    route: ActivatedRoute,
  ) {
    this.negocioRural$ = route.queryParams.pipe(
      map(it => it['name']),
      switchMap(name => store.select(negocioRural(name))),
      takeUntil(this.disposing$)
    );
  }

  ngOnDestroy(): void {
    this.disposing$.next(void 0);
  }

  updateSize(negocio: NegocioRural, size: number) {
    this.store.dispatch(updateSize({ negocio, size }));
  }

}
