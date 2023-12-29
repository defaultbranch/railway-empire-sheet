import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NEVER, Observable, combineLatest, map, take } from 'rxjs';
import { Store } from '@ngrx/store';

import { NegocioRural } from '../../ngrx/negocios-rurales.ngrx';
import { todosLosNegociosRurales } from '../../ngrx/negocios-rurales.ngrx';
import { Good, allGoods } from '../../../game-config/ngrx/goods.ngrx';
import { Ciudad } from '../../ngrx/ciudades.ngrx';
import { gameDate } from '../../../game-state/ngrx/game-date.ngrx';
import { updateDemandFactor } from '../../ngrx/provider-connections.ngrx';
import { allProviderConnections } from '../../ngrx/provider-connections.ngrx';
import { addProviderConnection, runProviderConnectionNow } from '../../ngrx/provider-connections.ngrx';
import { DemandsNgrxModule, allDemands } from '../../../game-config/ngrx/demands.ngrx';
import { allIndustries } from '../../../game-config/ngrx/industrias.ngrx';
import { NegociosNgrxModule, todosLosNegocios } from '../../../game-config/ngrx/negocios.ngrx';
import { businessDemandPerWeek, citizenDemandPerWeek, nextRun, ruralProductionPerWeek } from '../../util';
import { noValueError } from '../../../no-value-error';

type VM = {

  ruralProducer: string;
  good: string;

  demandPerWeek: number;

  productionFactor?: number;
  demandFactor?: number;
  effectiveRate: number;
  lastRun?: Date;
  nextRun?: Date;
};

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

  items$: Observable<VM[]> = NEVER;
  itemsSorted$: Observable<VM[]> = NEVER;

  rurales$: Observable<NegocioRural[]>;
  goods$: Observable<string[]>;
  gameDate$: Observable<Date>;

  newRuralProducer?: NegocioRural;
  newGood?: string;

  constructor(private store: Store) {
    this.rurales$ = store.select(todosLosNegociosRurales);
    this.goods$ = store.select(allGoods);
    this.gameDate$ = store.select(gameDate).pipe(map(it => new Date(`${it}T00:00:00Z`)));
  }

  ngOnInit() {
    this.items$ = combineLatest([
      this.store.select(allProviderConnections).pipe(
        map(providers => providers.filter(it => it.destinationCity === this.ciudad?.name))
      ),
      this.store.select(todosLosNegociosRurales),
      this.store.select(allDemands),
      this.store.select(allIndustries),
      this.store.select(todosLosNegocios),
    ], (providers, rurales, demands, industries, negocios) => {
      return providers
        .map(provider => {

          const rural = rurales.find(it => it.name === provider.ruralProducer && it.product === provider.good);
          const productionPerWeek = rural ? ruralProductionPerWeek(rural, negocios) : 0;
          const ciudad = this.ciudad ?? noValueError('no ciudad');
          const demandPerWeek
            = businessDemandPerWeek(provider, ciudad, industries)
            + citizenDemandPerWeek(provider, ciudad, demands);

          const effectiveRate = Math.min(productionPerWeek * (provider.productionFactor ?? 1.0), demandPerWeek * (provider.demandFactor ?? 1.0));

          return {

            ruralProducer: provider.ruralProducer,
            good: provider.good,
            destinationCity: provider.destinationCity,

            demandPerWeek,

            productionFactor: provider.productionFactor,
            demandFactor: provider.demandFactor,

            effectiveRate,

            lastRun: provider.lastRun,
            nextRun: provider.lastRun ? nextRun(provider.lastRun, effectiveRate) : undefined,
          };
        })
    });

    this.itemsSorted$ = this.items$.pipe(map(it => ([...it])));
    this.sortByNextRun();
  }

  productionPerWeek$(producerName: string, good: Good): Observable<number> {
    return combineLatest([
      this.store.select(todosLosNegociosRurales),
      this.store.select(todosLosNegocios)
    ], (rurales, negocios) => {
        const rural = rurales.find(it => it.name === producerName && it.product === good);
        return rural ? ruralProductionPerWeek(rural, negocios) : 0;
      }
    )
  }

  addLine(p: { ruralProducer: NegocioRural, good: string, destinationCity: Ciudad }) {
    this.store.dispatch(addProviderConnection({ line: { ruralProducer: p.ruralProducer.name, good: p.good, destinationCity: p.destinationCity.name } }));
  }

  sortByGood() {
    this.itemsSorted$ = this.items$.pipe(map(it => it.sort((a, b) => a.good.localeCompare(b.good))));
  }

  sortByNextRun() {
    this.itemsSorted$ = this.items$.pipe(map(it => [...it].sort((a, b) =>
      (a.nextRun && a.effectiveRate > 0)
        ? ((b.nextRun && b.effectiveRate > 0) ? a.nextRun.getTime() - b.nextRun.getTime() : -1)
        : ((b.nextRun && b.effectiveRate > 0) ? 1 : 0)
    )));
  }

  runningLate$(vm: VM): Observable<boolean> {
    return this.gameDate$.pipe(map(gameDate => vm.nextRun ? vm.nextRun.getTime() <= gameDate.getTime() : false));
  }

  runNow(line: VM) {
    const destinationCity = this.ciudad?.name;
    if (destinationCity) {
      this.gameDate$.pipe(take(1)).subscribe(date => this.store.dispatch(runProviderConnectionNow({ line: { ...line, destinationCity }, date })));
    }
  }

  updateDemandFactor(item: VM, factor: number) {
    const destinationCity = this.ciudad?.name;
    if (destinationCity) {
      this.store.dispatch(updateDemandFactor({ line: { ...item, destinationCity }, factor }));
    }
  }
}
