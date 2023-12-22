import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable, combineLatest, map, take } from 'rxjs';
import { Store } from '@ngrx/store';

import { NegocioRural } from '../../ngrx/negocios-rurales.ngrx';
import { Ciudad, todosLosCiudades } from '../../ngrx/ciudades.ngrx';
import { allGoods } from '../../../game-config/ngrx/goods.ngrx';
import { gameDate } from '../../ngrx/game-date.ngrx';
import { ProviderConnection, allProviderConnections, runProviderConnectionNow, updateProductionFactor } from '../../ngrx/provider-connections.ngrx';
import { DemandsNgrxModule, allDemands } from '../../../game-config/ngrx/demands.ngrx';
import { allIndustries } from '../../../game-config/ngrx/industrias.ngrx';
import { todosLosNegocios } from '../../../game-config/ngrx/negocios.ngrx';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type VM = {

  good: string;
  destinationCity: string;

  productionPerWeek: number;
  demandPerWeek: number;

  productionFactor?: number;
  demandFactor?: number;
  effectiveRate: number;
  lastRun?: Date;
  nextRun?: Date;
};

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
export class DirectNegocioProviderComponent {

  @Input() rural?: NegocioRural;

  items$: Observable<VM[]>;
  itemsSorted$: Observable<VM[]>;

  goods$: Observable<string[]>;
  ciudades$: Observable<Ciudad[]>;
  gameDate$: Observable<Date>;

  constructor(private store: Store) {

    this.goods$ = store.select(allGoods);
    this.ciudades$ = store.select(todosLosCiudades);
    this.gameDate$ = store.select(gameDate).pipe(map(it => new Date(`${it}T00:00:00Z`)));

    this.items$ = combineLatest([
      store.select(allProviderConnections).pipe(
        map(providers => providers.filter(it => it.ruralProducer === this.rural?.name))
      ),
      store.select(todosLosCiudades),
      store.select(allDemands),
      store.select(allIndustries),
      store.select(todosLosNegocios),
      this.gameDate$,
    ], (providers, ciudades, demands, industries, negocios, gameDate) => {
      return providers
        .map(provider => {

          const productionPerWeek = this.rural ? (negocios.find(it => it.name === this.rural?.product)?.productos?.find(it => it.name === this.rural?.product)?.perWeek ?? [])[this.rural.size - 1] ?? 0 : 0;
          const wagonsPerMillion = demands.find(it => it.good === provider.good)?.wagonsPerMillion ?? 0;
          const ciudad = ciudades.find(it => it.name === provider.destinationCity);
          const businesses = ciudad?.businesses ?? [];
          const businessDemandPerWeek = businesses.reduce((total, business) => {
            if (!business) throw Error('no business');
            const industrie = industries.find(it => it.name === business.business);
            const perWeek = (industrie?.materiasPrimas?.find(it => it.name === provider.good)?.perWeek ?? [])[business.size - 1] ?? 0;
            return total + perWeek;
          }, 0);
          const citizenDemandPerWeek = (ciudad?.population ?? 0) / 1e6 * wagonsPerMillion;
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

  sortByDestination() {
    this.itemsSorted$ = this.items$.pipe(map(it => it.sort((a, b) => a.destinationCity.localeCompare(b.destinationCity))));
  }

  sortByNextRun() {
    this.itemsSorted$ = this.items$.pipe(map(it => it.sort((a, b) => (a.nextRun?.getTime() ?? 0) - (b.nextRun?.getTime() ?? 0))));
  }

  runningLate$(vm: VM): Observable<boolean> {
    return this.gameDate$.pipe(map(gameDate => vm.nextRun ? vm.nextRun.getTime() < gameDate.getTime() : false ));
  }

  runNow(line: VM) {
    const ruralProducer = this.rural?.name;
    if (ruralProducer) {
      this.gameDate$.pipe(take(1)).subscribe(date => this.store.dispatch(runProviderConnectionNow({ line: { ...line, ruralProducer }, date })));
    }
  }

  updateProductionFactor(item: VM, factor: number) {
    const ruralProducer = this.rural?.name;
    if (ruralProducer) {
      this.store.dispatch(updateProductionFactor({ line: { ...item, ruralProducer }, factor }));
    }
  }

  private nextRun(line: ProviderConnection, effectiveRate: number) {
    if (line.lastRun) {
      const nextRun = new Date(line.lastRun);
      nextRun.setDate(nextRun.getDate() + 56 / effectiveRate);
      return nextRun;
    } else {
      return undefined;
    }
  }
}
