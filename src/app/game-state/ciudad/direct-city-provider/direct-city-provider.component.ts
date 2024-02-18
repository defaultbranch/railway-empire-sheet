import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NEVER, Observable, ReplaySubject, combineLatest, map, take } from 'rxjs';
import { Store } from '@ngrx/store';

import { NegocioRural } from '../../ngrx/negocios-rurales.ngrx';
import { todosLosNegociosRurales } from '../../ngrx/negocios-rurales.ngrx';
import { Good, allGoods } from '../../../game-config/ngrx/goods.ngrx';
import { Ciudad } from '../../ngrx/ciudades.ngrx';
import { gameDate } from '../../../game-state/ngrx/game-date.ngrx';
import { ProviderConnection, providerForDestinationCity, updateDemandFactor } from '../../ngrx/provider-connections.ngrx';
import { addProviderConnection, runProviderConnectionNow } from '../../ngrx/provider-connections.ngrx';
import { DemandsNgrxModule } from '../../../game-config/ngrx/demands.ngrx';
import { NegociosNgrxModule } from '../../../game-config/ngrx/negocios.ngrx';
import { sortObservableStream } from '../../util';
import { noValueError } from '../../../no-value-error';
import { providerDemandPerWeek, providerEffectiveRate, nextRun, ruralProductionPerWeek, runningLate } from '../../ngrx/computations';
import { cost, miles } from '../../ngrx/direct-lines.ngrx';

@Component({
  selector: 'app-direct-city-provider',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DemandsNgrxModule,
    NegociosNgrxModule,
  ],
  templateUrl: './direct-city-provider.component.html',
  styleUrl: './direct-city-provider.component.scss'
})
export class DirectCityProviderComponent implements OnInit {

  @Input() ciudad?: Ciudad;

  items$: Observable<ProviderConnection[]> = NEVER;
  itemsSorted$: Observable<ProviderConnection[]> = NEVER;

  rurales$: Observable<NegocioRural[]>;
  goods$: Observable<string[]>;
  gameDate$: Observable<Date>;

  newRuralProducer?: NegocioRural;
  newGood$ = new ReplaySubject<Good>(1);

  constructor(private store: Store) {
    this.rurales$ = store.select(todosLosNegociosRurales);
    this.goods$ = store.select(allGoods);
    this.gameDate$ = store.select(gameDate).pipe(map(it => new Date(`${it}T00:00:00Z`)));
  }

  ngOnInit() {
    this.items$ = this.store.select(providerForDestinationCity(this.ciudad?.name ?? noValueError('no city')));
    this.itemsSorted$ = this.items$.pipe(map(it => ([...it])));
    this.sortItemsByNextRun();
  }

  readonly runningLate$ = (provider: ProviderConnection) => this.store.select(runningLate(provider));
  readonly miles$ = (provider: ProviderConnection) => this.store.select(miles(provider.ruralProducer, provider.destinationCity));
  readonly cost$ = (provider: ProviderConnection) => this.store.select(cost(provider.ruralProducer, provider.destinationCity));
  readonly productionPerWeek$ = (producerName: string, good: Good) => this.store.select(ruralProductionPerWeek(producerName, good));
  readonly demandPerWeek$ = (provider: ProviderConnection) => this.store.select(providerDemandPerWeek(provider));
  readonly effectiveRate$ = (provider: ProviderConnection) => this.store.select(providerEffectiveRate(provider));
  readonly nextRun$ = (provider: ProviderConnection) => this.store.select(nextRun(provider));

  addLine(p: { ruralProducer: NegocioRural, good: string, destinationCity: Ciudad }) {
    this.store.dispatch(addProviderConnection({ line: { ruralProducer: p.ruralProducer.name, good: p.good, destinationCity: p.destinationCity.name } }));
  }

  sortByGood() {
    this.itemsSorted$ = this.items$.pipe(map(it => it.sort((a, b) => a.good.localeCompare(b.good))));
  }

  sortItemsByNextRun() {
    this.itemsSorted$ = this.itemsSorted(this.nextRun$, (a, b) => a ? (b ? a.getTime() - b.getTime() : -1) : (b ? 1 : 0));
  }

  private itemsSorted<C>(
    lookup: (item: ProviderConnection) => Observable<C>,
    compare: (a: C, b: C) => number,
  ) {
    return sortObservableStream(this.items$, lookup, compare);
  }

  runNow(line: ProviderConnection) {
    const destinationCity = this.ciudad?.name;
    if (destinationCity) {
      this.gameDate$.pipe(take(1)).subscribe(date => this.store.dispatch(runProviderConnectionNow({ line: { ...line, destinationCity }, date })));
    }
  }

  updateDemandFactor(item: ProviderConnection, factor: number) {
    const destinationCity = this.ciudad?.name;
    if (destinationCity) {
      this.store.dispatch(updateDemandFactor({ line: { ...item, destinationCity }, factor }));
    }
  }

  newGoodRurales$(): Observable<NegocioRural[]> {
    return combineLatest([this.rurales$, this.newGood$]).pipe(
      map(([rurales, newGood]) => rurales.filter(rural => { return newGood && newGood === rural.product })),
    );
  }
}
