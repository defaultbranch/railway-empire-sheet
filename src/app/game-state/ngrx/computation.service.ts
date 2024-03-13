import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { Good, allGoods } from "../../game-config/ngrx/goods.ngrx";
import { Observable, combineLatest, map, shareReplay, switchMap } from "rxjs";
import { businessProductionPerWeek, ruralProductionPerWeek } from "./computations";
import { allCityKeys } from "./ciudades.ngrx";
import { allLocalBusinessKeys } from "./negocios-rurales.ngrx";

const c
  : <K extends string | number | symbol, R>(key: K, cache: Record<K, Observable<R>>, factory: (key: K) => Observable<R>) => Observable<R>
  = (key, cache, factory) => cache[key] ?? (() => {
    const created = factory(key);
    cache[key] = created;
    return created;
  })();

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

  totalSupply$ = (key: Good) => c(key, this.totalSupply$cache, this.totalSupply_$.bind(this));
  private totalSupply$cache: Record<Good, Observable<number>> = {};
  private totalSupply_$(good: Good): Observable<number> {

    const citiesProduction$ = this.cities$.pipe(
      switchMap(cities => combineLatest(
        cities.map((city: any) =>
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

}
