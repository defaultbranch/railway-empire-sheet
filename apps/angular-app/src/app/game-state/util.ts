import { Observable, concatMap, filter, from, map, switchMap, take, toArray } from "rxjs";

// 'util.ts' is a collection of loose code snippets; this should be cleaned up eventually

/**
 *
 * @param items$ observable array of items, unsorted
 * @param toCriterion map one item to observable criteria value
 * @param compare compare criteria value
 * @returns observable array of items, sorted
 */
export function sortObservableStream<TValue, TCriterion>(
  items$: Observable<TValue[]>,
  toCriterion: (item: TValue) => Observable<TCriterion>,
  compare: (a: TCriterion, b: TCriterion) => number,
): Observable<TValue[]> {
  return items$.pipe(
    switchMap(items => from(items).pipe(
      concatMap(item => toCriterion(item).pipe(
        map(criteria => ([criteria, item] as const)),
        take(1)
      )),
      toArray(),
      map(items => [...items].sort((a, b) => compare(a[0], b[0]))),
      map(items => items.map(item => item[1])),
    ))
  );
}

export function filteredObservableStream<TValue, TCriterion>(
  items$: Observable<TValue[]>,
  toCriterion: (item: TValue) => Observable<TCriterion>,
  predicate: (a: TCriterion) => boolean,
): Observable<TValue[]> {
  return items$.pipe(
    switchMap(items => from(items).pipe(
      concatMap(item => toCriterion(item).pipe(
        map(criteria => ([criteria, item] as const)),
        take(1)
      )),
      toArray(),
      map(items => [...items].filter((a) => a[0])),
      map(items => items.map(item => item[1])),
    ))
  );
}
