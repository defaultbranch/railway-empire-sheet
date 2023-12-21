import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable, combineLatest, concatMap, filter, from, map, take } from 'rxjs';
import { Store } from '@ngrx/store';

import { NegocioRural } from '../ngrx/negocios-rurales.ngrx';
import { todosLosNegociosRurales } from '../ngrx/negocios-rurales.ngrx';
import { allGoods } from '../../game-config/ngrx/goods.ngrx';
import { Ciudad } from '../ngrx/ciudades.ngrx';
import { todosLosCiudades } from '../ngrx/ciudades.ngrx';
import { DirectLinesNgrxModule, allLines } from '../ngrx/direct-lines.ngrx';
import { DirectLine } from '../ngrx/direct-lines.ngrx';
import { addDirectLine } from '../ngrx/direct-lines.ngrx';
import { gameDate } from '../../game-state/ngrx/game-date.ngrx';
import { ProviderConnection } from '../ngrx/provider-connections.ngrx';
import { allProviderConnections } from '../ngrx/provider-connections.ngrx';
import { addProviderConnection, runProviderConnectionNow } from '../ngrx/provider-connections.ngrx';
import { GameDateComponent } from "../game-date/game-date.component";

type VM = {

  ruralProducer: string;
  good: string;
  destinationCity: string;

  productionFactor?: number;
  demandFactor?: number;
  lastRun?: Date;
  nextRun?: Date;

  miles?: number;
  cost?: number;
};

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
    ]
})
export class DirectLinesComponent {

  items$: Observable<VM[]>;
  itemsSorted$: Observable<VM[]>;

  rurales$: Observable<NegocioRural[]>;
  goods$: Observable<string[]>;
  ciudades$: Observable<Ciudad[]>;
  gameDate$: Observable<Date>;

  newRuralProducer?: NegocioRural;
  newGood?: string;
  newDestinationCity?: Ciudad;
  newMiles?: number;
  newCost?: number;

  constructor(private store: Store) {

    this.rurales$ = store.select(todosLosNegociosRurales);
    this.goods$ = store.select(allGoods);
    this.ciudades$ = store.select(todosLosCiudades);
    this.gameDate$ = store.select(gameDate).pipe(map(it => new Date(`${it}T00:00:00Z`)));

    this.items$ = combineLatest([
      store.select(allProviderConnections),
      store.select(allLines),
      store.select(todosLosNegociosRurales),
      store.select(todosLosCiudades),
      this.gameDate$,
    ], (providers, lines, rurales, ciudades, gameDate) => {
      return providers
        .map(provider => {

          const productionPerWeek = rurales.find(it => it.name === provider.ruralProducer && it.product === provider.good)?.perWeek ?? 0;
          const demandPerWeek = (ciudades.find(it => it.name === provider.destinationCity)?.perWeek ?? {})[provider.good] ?? 0;
          const effectiveRate = this.effectiveRate({ provider, productionPerWeek, demandPerWeek });

          const line = lines.find(line => line.ruralProducer == provider.ruralProducer && line.destinationCity == provider.destinationCity);

          return {

            ruralProducer: provider.ruralProducer,
            good: provider.good,
            destinationCity: provider.destinationCity,

            productionFactor: provider.productionFactor,
            demandFactor: provider.demandFactor,
            lastRun: provider.lastRun,
            nextRun: this.nextRun(provider, effectiveRate),

            miles: line?.miles,
            cost: line?.cost,
          };
        })
    });
    this.itemsSorted$ = this.items$;
  }

  addLine(p: { ruralProducer: NegocioRural, good: string, destinationCity: Ciudad, miles: number, cost: number }) {
    this.store.dispatch(addProviderConnection({ line: { ruralProducer: p.ruralProducer.name, good: p.good, destinationCity: p.destinationCity.name } }));
    this.store.dispatch(addDirectLine({ line: { ruralProducer: p.ruralProducer.name, destinationCity: p.destinationCity.name, miles: p.miles, cost: p.cost } }));
  }

  sortByCost() {
    this.itemsSorted$ = this.items$.pipe(map(it => it.sort((a, b) => (a.cost ?? 1e9) - (b.cost ?? 1e9))));
  }

  sortByMiles() {
    this.itemsSorted$ = this.items$.pipe(map(it => it.sort((a, b) => (a.miles ?? 1e9) - (b.miles ?? 1e9))));
  }

  sortByDestination() {
    this.itemsSorted$ = this.items$.pipe(map(it => it.sort((a, b) => a.destinationCity.localeCompare(b.destinationCity))));
  }

  sortByNextRun() {
    this.itemsSorted$ = this.items$.pipe(map(it => it.sort((a, b) => (a.nextRun?.getTime() ?? 0) - (b.nextRun?.getTime() ?? 0))));
  }

  productionPerWeek$(line: ProviderConnection): Observable<number> {
    return this.rurales$.pipe(
      concatMap(it => from(it)),
      filter(it => it.name === line.ruralProducer && it.product === line.good),
      map(it => it.perWeek)
    )
  }

  demandPerWeek$(line: ProviderConnection): Observable<number> {
    return this.ciudades$.pipe(
      concatMap(it => from(it)),
      filter(it => it.name === line.destinationCity),
      map(it => (it.perWeek ?? {})[line.good])
    )
  }

  effectiveRate(p: { provider: ProviderConnection, productionPerWeek: number, demandPerWeek: number }) {
    return Math.min(
      p.productionPerWeek * (p.provider.productionFactor ?? 1.0),
      p.demandPerWeek * (p.provider.demandFactor ?? 1.0));
  }

  effectiveRate$(provider: ProviderConnection): Observable<number> {
    return combineLatest([this.productionPerWeek$(provider), this.demandPerWeek$(provider)]).pipe(
      map(([prod, demand]) => this.effectiveRate({ provider, productionPerWeek: prod, demandPerWeek: demand }))
    );
  }

  runNow(line: ProviderConnection) {
    this.gameDate$.pipe(take(1)).subscribe(date => this.store.dispatch(runProviderConnectionNow({ line, date })));
  }

  nextRun(line: ProviderConnection, effectiveRate: number) {
    if (line.lastRun) {
      const nextRun = new Date(line.lastRun);
      nextRun.setDate(nextRun.getDate() + 56 / effectiveRate);
      return nextRun;
    } else {
      return undefined;
    }
  }

  nextRun$(line: ProviderConnection): Observable<Date | undefined> {
    return combineLatest([this.effectiveRate$(line)]).pipe(
      map(([effectiveRate]) => this.nextRun(line, effectiveRate))
    )
  }
}
