import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable, combineLatest, map, take } from 'rxjs';
import { Store } from '@ngrx/store';

import { NegocioRural } from '../ngrx/negocios-rurales.ngrx';
import { todosLosNegociosRurales } from '../ngrx/negocios-rurales.ngrx';
import { allGoods } from '../../game-config/ngrx/goods.ngrx';
import { Ciudad } from '../ngrx/ciudades.ngrx';
import { todosLosCiudades } from '../ngrx/ciudades.ngrx';
import { DirectLinesNgrxModule, allLines } from '../ngrx/direct-lines.ngrx';
import { addDirectLine } from '../ngrx/direct-lines.ngrx';
import { gameDate } from '../../game-state/ngrx/game-date.ngrx';
import { ProviderConnection } from '../ngrx/provider-connections.ngrx';
import { allProviderConnections } from '../ngrx/provider-connections.ngrx';
import { addProviderConnection, runProviderConnectionNow } from '../ngrx/provider-connections.ngrx';
import { GameDateComponent } from "../game-date/game-date.component";
import { DemandsNgrxModule, allDemands } from '../../game-config/ngrx/demands.ngrx';
import { allIndustries } from '../../game-config/ngrx/industrias.ngrx';
import { NegociosNgrxModule, todosLosNegocios } from '../../game-config/ngrx/negocios.ngrx';
import { businessDemandPerWeek, citizenDemandPerWeek, nextRun, ruralProductionPerWeek } from '../util';

type VM = {

  ruralProducer: string;
  good: string;
  destinationCity: string;

  productionPerWeek: number;
  demandPerWeek: number;

  productionFactor?: number;
  demandFactor?: number;
  effectiveRate: number;
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
    DemandsNgrxModule,
    NegociosNgrxModule,
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
      store.select(allDemands),
      store.select(allIndustries),
      store.select(todosLosNegocios),
    ], (providers, lines, rurales, ciudades, demands, industries, negocios) => {
      return providers
        .map(provider => {

          const rural = rurales.find(it => it.name === provider.ruralProducer && it.product === provider.good);
          const productionPerWeek = rural ? ruralProductionPerWeek(rural, negocios) : 0;
          const ciudad = ciudades.find(it => it.name === provider.destinationCity) ?? (() => { throw Error('no ciudad') })();
          const demandPerWeek
            = businessDemandPerWeek(provider, ciudad, industries)
            + citizenDemandPerWeek(provider, ciudad, demands);
          const effectiveRate = Math.min(productionPerWeek * (provider.productionFactor ?? 1.0), demandPerWeek * (provider.demandFactor ?? 1.0));

          const line = lines.find(line => line.ruralProducer == provider.ruralProducer && line.destinationCity == provider.destinationCity);

          return {

            ruralProducer: provider.ruralProducer,
            good: provider.good,
            destinationCity: provider.destinationCity,

            productionPerWeek,
            demandPerWeek,

            productionFactor: provider.productionFactor,
            demandFactor: provider.demandFactor,

            effectiveRate,

            lastRun: provider.lastRun,
            nextRun: provider.lastRun ? nextRun(provider.lastRun, effectiveRate) : undefined,

            miles: line?.miles,
            cost: line?.cost,
          };
        })
    });

    this.itemsSorted$ = this.items$.pipe(map(it => ([...it])));
    this.sortByNextRun();
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
    this.itemsSorted$ = this.items$.pipe(map(it => [...it].sort((a, b) =>
      (a.nextRun && a.effectiveRate > 0)
        ? ((b.nextRun && b.effectiveRate > 0) ? a.nextRun.getTime() - b.nextRun.getTime() : -1)
        : ((b.nextRun && b.effectiveRate > 0) ? 1 : 0)
    )));
  }

  runningLate$(vm: VM): Observable<boolean> {
    return this.gameDate$.pipe(map(gameDate => vm.nextRun ? vm.nextRun.getTime() < gameDate.getTime() : false));
  }

  runNow(line: ProviderConnection) {
    this.gameDate$.pipe(take(1)).subscribe(date => this.store.dispatch(runProviderConnectionNow({ line, date })));
  }
}
