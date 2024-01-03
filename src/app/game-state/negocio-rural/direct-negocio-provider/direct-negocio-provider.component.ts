import { Component, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NEVER, Observable, concatMap, from, map, switchMap, take, toArray } from 'rxjs';
import { Store } from '@ngrx/store';

import { NegocioRural } from '../../ngrx/negocios-rurales.ngrx';
import { Ciudad, todosLosCiudades } from '../../ngrx/ciudades.ngrx';
import { Good, allGoods } from '../../../game-config/ngrx/goods.ngrx';
import { gameDate } from '../../ngrx/game-date.ngrx';
import { ProviderConnection, addProviderConnection, providerForRuralProducer, runProviderConnectionNow, updateProductionFactor } from '../../ngrx/provider-connections.ngrx';
import { DemandsNgrxModule } from '../../../game-config/ngrx/demands.ngrx';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { noValueError } from '../../../no-value-error';
import { providerDemandPerWeek, providerEffectiveRate, nextRun, ruralProductionPerWeek, runningLate } from '../../ngrx/computations';
import { cost, miles } from '../../ngrx/direct-lines.ngrx';
import { sortObservableStream } from '../../util';

@Component({
  selector: 'app-direct-negocio-provider',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DemandsNgrxModule,
  ],
  templateUrl: './direct-negocio-provider.component.html',
  styleUrl: './direct-negocio-provider.component.scss'
})
export class DirectNegocioProviderComponent implements OnInit {

  @Input() rural?: NegocioRural;

  items$: Observable<ProviderConnection[]> = NEVER;
  itemsSorted$: Observable<ProviderConnection[]> = NEVER;

  goods$: Observable<string[]>;
  ciudades$: Observable<Ciudad[]>;
  gameDate$: Observable<Date>;

  newDestinationCity?: Ciudad;

  constructor(private store: Store) {
    this.goods$ = store.select(allGoods);
    this.ciudades$ = store.select(todosLosCiudades);
    this.gameDate$ = store.select(gameDate).pipe(map(it => new Date(`${it}T00:00:00Z`)));
  }

  ngOnInit() {
    this.items$ = this.store.select(providerForRuralProducer(this.rural?.name ?? noValueError('no rural')));
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

  sortByDestination() {
    this.itemsSorted$ = this.items$.pipe(map(it => it.sort((a, b) => a.destinationCity.localeCompare(b.destinationCity))));
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
    const ruralProducer = this.rural?.name;
    if (ruralProducer) {
      this.gameDate$.pipe(take(1)).subscribe(date => this.store.dispatch(runProviderConnectionNow({ line: { ...line, ruralProducer }, date })));
    }
  }

  updateProductionFactor(item: ProviderConnection, factor: number) {
    const ruralProducer = this.rural?.name;
    if (ruralProducer) {
      this.store.dispatch(updateProductionFactor({ line: { ...item, ruralProducer }, factor }));
    }
  }

  balance() {
    this.items$.pipe(
      take(1),
      switchMap(items => from(items).pipe(
        concatMap(item => this.effectiveRate$(item).pipe(
          map(effectiveRate => ([effectiveRate, item] as const)),
          take(1)
        )),
        toArray()
      ))
    ).subscribe(items => {
      const total = items.reduce((total, it) => total + it[0], 0);
      for (const item of items) {
        this.updateProductionFactor(item[1], total > 0 ? item[0] / total : 1 / items.length);
      }
    });
  }
}
