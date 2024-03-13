import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { Good, allGoods } from "../../game-config/ngrx/goods.ngrx";
import { Observable, combineLatest, flatMap, map, shareReplay, switchMap } from "rxjs";
import { businessProductionPerWeek, cityDemandPerWeek, ruralProductionPerWeek } from "./computations";
import { allCityKeys } from "./ciudades.ngrx";
import { allLocalBusinessKeys } from "./negocios-rurales.ngrx";


@Injectable({ providedIn: 'root' })
export class ComputationService {

  goods$: Observable<Good[]>;
  cities$: Observable<string[]>;
  rurales$: Observable<string[]>;

  constructor(private store: Store) {
    this.goods$ = store.select(allGoods);
    this.cities$ = store.select(allCityKeys);
    this.rurales$ = store.select(allLocalBusinessKeys);
  }

  totalSupply$ = (key: Good) => c1(key, this.totalSupply$cache, this.totalSupply_$.bind(this));
  private totalSupply$cache: Record<Good, Observable<number>> = {};
  private totalSupply_$(good: Good): Observable<number> {

    const citiesProduction$ = this.cities$.pipe(
      switchMap(cities => combineLatest(
        cities.map((city: string) =>
          this.store.select(businessProductionPerWeek(city, good))
        )
      )),
      map(values => values.reduceRight((a, b) => a + b))
    );

    const ruralesProduction$ = this.rurales$.pipe(
      switchMap(rurales => combineLatest(
        rurales.map(rural =>
          this.store.select(ruralProductionPerWeek(rural, good)))
      )),
      map(values => values.reduceRight((a, b) => a + b))
    );

    return combineLatest([citiesProduction$, ruralesProduction$]).pipe(
      map(([a, b]) => a + b)
    );
  }

  totalDemand$ = (key: Good) => c1(key, this.totalDemand$cache, this.totalDemand_$.bind(this));
  private totalDemand$cache: Record<Good, Observable<number>> = {};
  private totalDemand_$(good: Good): Observable<number> {
    return this.cities$.pipe(
      switchMap(cities => combineLatest(
        cities.map(city =>
          this.store.select(cityDemandPerWeek(city, good))
        )
      )),
      map(values => values.reduceRight((a, b) => a + b))
    )
  }

  totalSupplyDemandRatio$ = (key: Good) => c1(key, this.totalSupplyDemandRatio$cache, this.totalSupplyDemandRatio_$.bind(this));
  private totalSupplyDemandRatio$cache: Record<Good, Observable<number>> = {};
  private totalSupplyDemandRatio_$(good: Good): Observable<number> {
    return combineLatest([this.totalSupply$(good), this.totalDemand$(good)], (supply, demand) => supply/demand);
  }

  goodsByTotalSupplyDesc$(): Observable<Good[]> {
    return this.goods$.pipe(
      switchMap(goods => combineLatest(goods.map(good => this.totalSupply$(good).pipe(map(supply => ({ good, supply })))))),
      map(goodSupplies => {
        goodSupplies.sort((a, b) => b.supply - a.supply);
        return goodSupplies.map(goodSupply => goodSupply.good);
      }),
      shareReplay(1)
    )
  }

  goodsByTotalDemandDesc$(): Observable<Good[]> {
    return this.goods$.pipe(
      switchMap(goods => combineLatest(goods.map(good => this.totalDemand$(good).pipe(map(demand => ({ good, demand })))))),
      map(goodDemands => {
        goodDemands.sort((a, b) => b.demand - a.demand);
        return goodDemands.map(goodDemand => goodDemand.good);
      }),
      shareReplay(1)
    )
  }

  goodsByTotalSupplyDemandRatio$(): Observable<Good[]> {
    return this.goods$.pipe(
      switchMap(goods => combineLatest(goods.map(good => this.totalSupplyDemandRatio$(good).pipe(map(ratio => ({ good, ratio })))))),
      map(goodSupplyDemandRatios => {
        goodSupplyDemandRatios.sort((a, b) => a.ratio - b.ratio);
        return goodSupplyDemandRatios.map(goodSupplyDemandRatio => goodSupplyDemandRatio.good);
      }),
      shareReplay(1)
    )
  }

}


const c1
  : <K extends string | number | symbol, R>(key: K, cache: Record<K, Observable<R>>, factory: (key: K) => Observable<R>) => Observable<R>
  = (key, cache, factory) => cache[key] ?? (() => {
    const created = factory(key).pipe(shareReplay(1));
    cache[key] = created;
    return created;
  })();
