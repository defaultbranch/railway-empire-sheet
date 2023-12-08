import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, Subscriber, filter, map, switchMap, takeUntil, tap } from 'rxjs';
import { Ciudad } from '../ciudad';
import { ciudad } from '../ciudad.state';

@Component({
  selector: 'app-ciudad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ciudad.component.html',
  styleUrl: './ciudad.component.scss'
})
export class CiudadComponent implements OnDestroy {

  ciudad$: Observable<Ciudad | undefined>;

  private disposing$ = new Subject<void>();

  constructor(
    route: ActivatedRoute,
    store: Store,
  ) {
    this.ciudad$ = route.queryParams.pipe(
      map(it => it['name']),
      switchMap(name => store.select(ciudad(name))),
      takeUntil(this.disposing$)
    );
  }

  ngOnDestroy(): void {
    this.disposing$.next(void 0);
  }
}
