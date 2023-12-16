import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable, combineLatest, concatMap, filter, from, map, of, take } from 'rxjs';
import { Store } from '@ngrx/store';

import { NegocioRural } from '../../negocios-rurales';
import { todosLosNegociosRurales } from '../../negocios-rurales';
import { allGoods } from '../../goods';
import { Ciudad } from '../../ciudades';
import { gameDate } from '../../game-date';
import { ProviderConnection } from '../../provider-connections';
import { allProviderConnections } from '../../provider-connections';
import { addProviderConnection, runProviderConnectionNow } from '../../provider-connections';

@Component({
  selector: 'app-direct-city-provider',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './direct-city-provider.component.html',
  styleUrl: './direct-city-provider.component.scss'
})
export class DirectCityProviderComponent {

  @Input() ciudad?: Ciudad;

  lines$: Observable<(ProviderConnection)[]>;
  linesSorted$: Observable<(ProviderConnection)[]>;

  rurales$: Observable<NegocioRural[]>;
  goods$: Observable<string[]>;
  gameDate$: Observable<Date>;

  newRuralProducer?: NegocioRural;
  newGood?: string;

  constructor(private store: Store) {

    this.lines$ = store.select(allProviderConnections).pipe(
      map(providers => providers.filter(it => it.destinationCity === this.ciudad?.name))
    );

    this.linesSorted$ = this.lines$;

    this.rurales$ = store.select(todosLosNegociosRurales);
    this.goods$ = store.select(allGoods);
    this.gameDate$ = store.select(gameDate).pipe(map(it => new Date(`${it}T00:00:00Z`)));
  }


  addLine(p: { ruralProducer: NegocioRural, good: string, destinationCity: Ciudad }) {
    this.store.dispatch(addProviderConnection({ line: { ruralProducer: p.ruralProducer.name, good: p.good, destinationCity: p.destinationCity.name } }));
  }

  sortByDestination() {
    this.linesSorted$ = this.lines$.pipe(map(it => it.sort((a, b) => a.destinationCity.localeCompare(b.destinationCity))));
  }

  sortByNextRun() {
    this.linesSorted$ = combineLatest([
      this.lines$,
      this.rurales$,
    ]).pipe(
      map(([lines, rurales]) => lines.map(line => {
        const productionPerWeek = rurales.find(it => it.name === line.ruralProducer && it.product === line.good)?.perWeek ?? 0;
        const demandPerWeek = (this.ciudad?.perWeek ?? {})[line.good] ?? 0;
        const effectiveRate = this.effectiveRate({ line, productionPerWeek, demandPerWeek });
        return {
          ...line,
          nextRun: this.nextRun(line, effectiveRate)
        }
      })),
      map(lines => lines.sort((a, b) => (a.nextRun?.getTime() ?? 0) - (b.nextRun?.getTime() ?? 0)))
    );
  }

  productionPerWeek$(line: ProviderConnection): Observable<number> {
    return this.rurales$.pipe(
      concatMap(it => from(it)),
      filter(it => it.name === line.ruralProducer && it.product === line.good),
      map(it => it.perWeek)
    )
  }

  demandPerWeek$(line: ProviderConnection): Observable<number> {
    return of((this.ciudad?.perWeek ?? {})[line.good]);
  }

  effectiveRate(p: { line: ProviderConnection, productionPerWeek: number, demandPerWeek: number }) {
    return Math.min(
      p.productionPerWeek * (p.line.productionFactor ?? 1.0),
      p.demandPerWeek * (p.line.demandFactor ?? 1.0));
  }

  effectiveRate$(line: ProviderConnection): Observable<number> {
    return combineLatest([this.productionPerWeek$(line), this.demandPerWeek$(line)]).pipe(
      map(([prod, demand]) => this.effectiveRate({ line, productionPerWeek: prod, demandPerWeek: demand }))
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
