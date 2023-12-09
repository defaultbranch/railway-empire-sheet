import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NEVER, Observable, combineLatest, concatMap, filter, flatMap, from, map, take } from 'rxjs';
import { Store } from '@ngrx/store';

import { NegocioRural } from '../negocio-rural';
import { todosLosNegociosRurales } from '../negocio-rural.state';
import { allGoods } from '../goods.state';
import { Ciudad } from '../ciudad';
import { todosLosCiudades } from '../ciudad.state';
import { allLines } from '../direct-lines.state';
import { DirectLine } from '../direct-line';
import { addDirectLine, runDirectLineNow } from '../direct-lines.actions';
import { gameDate } from '../game-date.state';

@Component({
  selector: 'app-direct-trains',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './direct-lines.component.html',
  styleUrl: './direct-lines.component.scss'
})
export class DirectLinesComponent {

  lines$: Observable<DirectLine[]>;
  linesSorted$: Observable<DirectLine[]>;

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

    this.lines$ = store.select(allLines);
    this.linesSorted$ = this.lines$;

    this.rurales$ = store.select(todosLosNegociosRurales);
    this.goods$ = store.select(allGoods);
    this.ciudades$ = store.select(todosLosCiudades);
    this.gameDate$ = store.select(gameDate).pipe(map(it => new Date(`${it}T00:00:00Z`)));
  }

  addLine(p: { ruralProducer: NegocioRural, good: string, destinationCity: Ciudad, miles: number, cost: number }) {
    console.log(p);
    this.store.dispatch(addDirectLine({ line: { ruralProducer: p.ruralProducer.name, good: p.good, destinationCity: p.destinationCity.name, miles: p.miles, cost: p.cost } }));
  }

  sortByCost() {
    this.linesSorted$ = this.lines$.pipe(map(it => it.sort((a, b) => a.cost - b.cost)));
  }

  sortByMiles() {
    this.linesSorted$ = this.lines$.pipe(map(it => it.sort((a, b) => a.miles - b.miles)));
  }

  productionPerWeek$(line: DirectLine): Observable<number> {
    return this.rurales$.pipe(
      concatMap(it => from(it)),
      filter(it => it.name === line.ruralProducer && it.product === line.good),
      map(it => it.perWeek)
    )
  }

  demandPerWeek$(line: DirectLine): Observable<number> {
    return this.ciudades$.pipe(
      concatMap(it => from(it)),
      filter(it => it.name === line.destinationCity),
      map(it => (it.perWeek ?? {})[line.good])
    )
  }

  effectiveRate$(line: DirectLine): Observable<number> {
    return combineLatest([this.productionPerWeek$(line), this.demandPerWeek$(line)]).pipe(
      map(([prod, demand]) => Math.min(prod * (line.productionFactor ?? 1.0), demand * (line.demandFactor ?? 1.0)))
    );
  }

  runNow(line: DirectLine) {
    this.gameDate$.pipe(take(1)).subscribe(date => this.store.dispatch(runDirectLineNow({ line, date})));
  }

  nextRun$(line: DirectLine): Observable<Date | undefined> {
    return combineLatest([this.effectiveRate$(line)]).pipe(
      map(([effectiveRate]) => {
        if (line.lastRun) {
          const nextRun = new Date(line.lastRun);
          nextRun.setDate(nextRun.getDate() + 56/effectiveRate);
          return nextRun;
        } else {
          return undefined;
        }
      })
    )
  }
}
