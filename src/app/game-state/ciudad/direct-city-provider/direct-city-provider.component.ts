import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable, combineLatest, map, take } from 'rxjs';
import { Store } from '@ngrx/store';

import { NegocioRural } from '../../ngrx/negocios-rurales.ngrx';
import { todosLosNegociosRurales } from '../../ngrx/negocios-rurales.ngrx';
import { allGoods } from '../../../game-config/ngrx/goods.ngrx';
import { Ciudad } from '../../ngrx/ciudades.ngrx';
import { gameDate } from '../../../game-state/ngrx/game-date.ngrx';
import { ProviderConnection, updateDemandFactor } from '../../ngrx/provider-connections.ngrx';
import { allProviderConnections } from '../../ngrx/provider-connections.ngrx';
import { addProviderConnection, runProviderConnectionNow } from '../../ngrx/provider-connections.ngrx';
import { DemandsNgrxModule, allDemands } from '../../../game-config/ngrx/demands.ngrx';
import { allIndustries } from '../../../game-config/ngrx/industrias.ngrx';

type VM = {

  ruralProducer: string;
  good: string;

  productionPerWeek: number;
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
  ],
  templateUrl: './direct-city-provider.component.html',
  styleUrl: './direct-city-provider.component.scss'
})
export class DirectCityProviderComponent {

  @Input() ciudad?: Ciudad;

  items$: Observable<VM[]>;
  itemsSorted$: Observable<VM[]>;

  rurales$: Observable<NegocioRural[]>;
  goods$: Observable<string[]>;
  gameDate$: Observable<Date>;

  newRuralProducer?: NegocioRural;
  newGood?: string;

  constructor(private store: Store) {

    this.rurales$ = store.select(todosLosNegociosRurales);
    this.goods$ = store.select(allGoods);
    this.gameDate$ = store.select(gameDate).pipe(map(it => new Date(`${it}T00:00:00Z`)));

    this.items$ = combineLatest([
      store.select(allProviderConnections).pipe(
        map(providers => providers.filter(it => it.destinationCity === this.ciudad?.name))
      ),
      store.select(todosLosNegociosRurales),
      store.select(allDemands),
      store.select(allIndustries),
      this.gameDate$,
    ], (providers, rurales, demands, industries, gameDate) => {
      return providers
        .map(provider => {

          const productionPerWeek = rurales.find(it => it.name === provider.ruralProducer && it.product === provider.good)?.perWeek ?? 0;
          const wagonsPerMillion = demands.find(it => it.good === provider.good)?.wagonsPerMillion ?? 0;
          const businesses = this.ciudad?.businesses ?? [];
          const businessDemandPerWeek = businesses.reduce((total, business) => {
            if (!business) throw Error('no business');
            const industrie = industries.find(it => it.name === business.business);
            const perWeek = (industrie?.materiasPrimas?.find(it => it.name === provider.good)?.perWeek ?? [])[business.size - 1] ?? 0;
            return total + perWeek;
          }, 0);
          const citizenDemandPerWeek = (this.ciudad?.population ?? 0) / 1e6 * wagonsPerMillion;
          const demandPerWeek = businessDemandPerWeek + citizenDemandPerWeek;

          const effectiveRate = Math.min(productionPerWeek * (provider.productionFactor ?? 1.0), demandPerWeek * (provider.demandFactor ?? 1.0));

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
            nextRun: this.nextRun(provider, effectiveRate),
          };
        })
    });
    this.itemsSorted$ = this.items$;
  }


  addLine(p: { ruralProducer: NegocioRural, good: string, destinationCity: Ciudad }) {
    this.store.dispatch(addProviderConnection({ line: { ruralProducer: p.ruralProducer.name, good: p.good, destinationCity: p.destinationCity.name } }));
  }

  sortByGood() {
    this.itemsSorted$ = this.items$.pipe(map(it => it.sort((a, b) => a.good.localeCompare(b.good))));
  }

  sortByNextRun() {
    this.itemsSorted$ = this.items$.pipe(map(it => it.sort((a, b) => (a.nextRun?.getTime() ?? 0) - (b.nextRun?.getTime() ?? 0))));
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

  private nextRun(line: ProviderConnection, effectiveRate: number) {
    if (line.lastRun && effectiveRate > 0) {
      const nextRun = new Date(line.lastRun);
      nextRun.setDate(nextRun.getDate() + 56 / effectiveRate);
      return nextRun;
    } else {
      return undefined;
    }
  }
}
