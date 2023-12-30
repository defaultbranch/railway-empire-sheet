import { Observable, concatMap, from, map, switchMap, take, toArray } from "rxjs";

// 'util.ts' is a collection of loose code snippets; this should be cleaned up eventually

export function sortObservableStream<T, C>(
  items$: Observable<T[]>,
  lookup: (item: T) => Observable<C>,
  compare: (a: C, b: C) => number,
): Observable<T[]> {
  return items$.pipe(
    switchMap(items => from(items).pipe(
      concatMap(item => lookup(item).pipe(
        map(criteria => ([criteria, item] as const)),
        take(1)
      )),
      toArray(),
      map(items => [...items].sort((a, b) => compare(a[0], b[0]))),
      map(items => items.map(item => item[1])),
    ))
  );
}
