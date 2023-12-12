import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable, combineLatest, concatMap, filter, from, map, of, take } from 'rxjs';
import { Store } from '@ngrx/store';

import { NegocioRural } from '../../negocio-rural';
import { todosLosNegociosRurales } from '../../negocio-rural.state';
import { allGoods } from '../../goods.state';
import { Ciudad } from '../../ciudad';
import { todosLosCiudades } from '../../ciudad.state';
import { allLines } from '../../direct-lines.state';
import { DirectLine } from '../../direct-line';
import { addDirectLine, runDirectLineNow } from '../../direct-lines.actions';
import { gameDate } from '../../game-date.state';

@Component({
  selector: 'app-direct-city-lines',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './direct-city-lines.component.html',
  styleUrl: './direct-city-lines.component.scss'
})
export class DirectCityLinesComponent {

  @Input() ciudad?: Ciudad;

  lines$: Observable<DirectLine[]>;
  linesSorted$: Observable<DirectLine[]>;

  rurales$: Observable<NegocioRural[]>;
  goods$: Observable<string[]>;
  gameDate$: Observable<Date>;

  newRuralProducer?: NegocioRural;
  newGood?: string;
  newMiles?: number;
  newCost?: number;

  constructor(private store: Store) {

    this.lines$ = store.select(allLines).pipe(map(lines => lines.filter(line => line.destinationCity === this.ciudad?.name)));
    this.linesSorted$ = this.lines$;

    this.rurales$ = store.select(todosLosNegociosRurales);
    this.goods$ = store.select(allGoods);
    this.gameDate$ = store.select(gameDate).pipe(map(it => new Date(`${it}T00:00:00Z`)));
  }


  addLine(p: { ruralProducer: NegocioRural, good: string, destinationCity: Ciudad, miles: number, cost: number }) {
    this.store.dispatch(addDirectLine({ line: { ruralProducer: p.ruralProducer.name, good: p.good, destinationCity: p.destinationCity.name, miles: p.miles, cost: p.cost } }));
  }

  sortByCost() {
    this.linesSorted$ = this.lines$.pipe(map(it => it.sort((a, b) => a.cost - b.cost)));
  }

  sortByMiles() {
    this.linesSorted$ = this.lines$.pipe(map(it => it.sort((a, b) => a.miles - b.miles)));
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
        const effectiveRate = this.effectiveRate({ line, productionPerWeek, demandPerWeek});
        return {
          ...line,
          nextRun: this.nextRun(line, effectiveRate)
        }
      })),
      map(lines => lines.sort((a, b) => (a.nextRun?.getTime() ?? 0) - (b.nextRun?.getTime() ?? 0)))
    );
  }

  productionPerWeek$(line: DirectLine): Observable<number> {
    return this.rurales$.pipe(
      concatMap(it => from(it)),
      filter(it => it.name === line.ruralProducer && it.product === line.good),
      map(it => it.perWeek)
    )
  }

  demandPerWeek$(line: DirectLine): Observable<number> {
    return of((this.ciudad?.perWeek ?? {})[line.good]);
  }

  effectiveRate(p: { line: DirectLine, productionPerWeek: number, demandPerWeek: number }) {
    return Math.min(
      p.productionPerWeek * (p.line.productionFactor ?? 1.0),
      p.demandPerWeek * (p.line.demandFactor ?? 1.0));
  }

  effectiveRate$(line: DirectLine): Observable<number> {
    return combineLatest([this.productionPerWeek$(line), this.demandPerWeek$(line)]).pipe(
      map(([prod, demand]) => this.effectiveRate({ line, productionPerWeek: prod, demandPerWeek: demand }))
    );
  }

  runNow(line: DirectLine) {
    this.gameDate$.pipe(take(1)).subscribe(date => this.store.dispatch(runDirectLineNow({ line, date })));
  }

  nextRun(line: DirectLine, effectiveRate: number) {
    if (line.lastRun) {
      const nextRun = new Date(line.lastRun);
      nextRun.setDate(nextRun.getDate() + 56 / effectiveRate);
      return nextRun;
    } else {
      return undefined;
    }
  }

  nextRun$(line: DirectLine): Observable<Date | undefined> {
    return combineLatest([this.effectiveRate$(line)]).pipe(
      map(([effectiveRate]) => this.nextRun(line, effectiveRate))
    )
  }
}