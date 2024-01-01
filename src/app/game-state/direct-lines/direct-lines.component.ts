import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NEVER, Observable, map, take } from 'rxjs';
import { Store } from '@ngrx/store';

import { NegocioRural } from '../ngrx/negocios-rurales.ngrx';
import { todosLosNegociosRurales } from '../ngrx/negocios-rurales.ngrx';
import { Good, allGoods } from '../../game-config/ngrx/goods.ngrx';
import { Ciudad } from '../ngrx/ciudades.ngrx';
import { todosLosCiudades } from '../ngrx/ciudades.ngrx';
import { DirectLinesNgrxModule, cost, miles } from '../ngrx/direct-lines.ngrx';
import { addDirectLine } from '../ngrx/direct-lines.ngrx';
import { gameDate } from '../../game-state/ngrx/game-date.ngrx';
import { ProviderConnection } from '../ngrx/provider-connections.ngrx';
import { allProviderConnections } from '../ngrx/provider-connections.ngrx';
import { addProviderConnection, runProviderConnectionNow } from '../ngrx/provider-connections.ngrx';
import { GameDateComponent } from "../game-date/game-date.component";
import { DemandsNgrxModule } from '../../game-config/ngrx/demands.ngrx';
import { NegociosNgrxModule } from '../../game-config/ngrx/negocios.ngrx';
import { sortObservableStream } from '../util';
import { providerDemandPerWeek, effectiveRate, nextRun, productionPerWeek, runningLate } from '../ngrx/computations';

@Component({
  selector: 'app-direct-trains',
  standalone: true,
  templateUrl: './direct-lines.component.html',
  styleUrl: './direct-lines.component.scss',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    GameDateComponent,
    DirectLinesNgrxModule,
    DemandsNgrxModule,
    NegociosNgrxModule,
  ]
})
export class DirectLinesComponent implements OnInit {

  items$: Observable<ProviderConnection[]> = NEVER;
  itemsSorted$: Observable<ProviderConnection[]> = NEVER;

  rurales$: Observable<NegocioRural[]>;
  goods$: Observable<Good[]>;
  ciudades$: Observable<Ciudad[]>;
  gameDate$: Observable<Date>;

  newRuralProducer?: NegocioRural;
  newGood?: Good;
  newDestinationCity?: Ciudad;
  newMiles?: number;
  newCost?: number;

  constructor(private store: Store) {
    this.rurales$ = store.select(todosLosNegociosRurales);
    this.goods$ = store.select(allGoods);
    this.ciudades$ = store.select(todosLosCiudades);
    this.gameDate$ = store.select(gameDate).pipe(map(it => new Date(`${it}T00:00:00Z`)));
  }

  ngOnInit() {
    this.items$ = this.store.select(allProviderConnections);
    this.itemsSorted$ = this.items$.pipe(map(it => ([...it])));
    this.sortItemsByNextRun();
  }

  readonly runningLate$ = (provider: ProviderConnection) => this.store.select(runningLate(provider));
  readonly miles$ = (provider: ProviderConnection) => this.store.select(miles(provider.ruralProducer, provider.destinationCity));
  readonly cost$ = (provider: ProviderConnection) => this.store.select(cost(provider.ruralProducer, provider.destinationCity));
  readonly productionPerWeek$ = (producerName: string, good: Good) => this.store.select(productionPerWeek(producerName, good));
  readonly demandPerWeek$ = (provider: ProviderConnection) => this.store.select(providerDemandPerWeek(provider));
  readonly effectiveRate$ = (provider: ProviderConnection) => this.store.select(effectiveRate(provider));
  readonly nextRun$ = (provider: ProviderConnection) => this.store.select(nextRun(provider));

  addLine(p: { ruralProducer: NegocioRural, good: string, destinationCity: Ciudad, miles: number, cost: number }) {
    this.store.dispatch(addProviderConnection({ line: { ruralProducer: p.ruralProducer.name, good: p.good, destinationCity: p.destinationCity.name } }));
    this.store.dispatch(addDirectLine({ line: { ruralProducer: p.ruralProducer.name, destinationCity: p.destinationCity.name, miles: p.miles, cost: p.cost } }));
  }

  sortByCost() {
    this.itemsSorted$ = this.itemsSorted(this.cost$, (a, b) => (a ?? 1e9) - (b ?? 1e9));
  }

  sortByMiles() {
    this.itemsSorted$ = this.itemsSorted(this.miles$, (a, b) => (a ?? 1e9) - (b ?? 1e9));
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
    this.gameDate$.pipe(take(1)).subscribe(date => this.store.dispatch(runProviderConnectionNow({ line, date })));
  }
}
