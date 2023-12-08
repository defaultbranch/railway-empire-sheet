import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, map, switchMap, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';

import { Ciudad } from '../ciudad';
import { ciudad } from '../ciudad.state';
import { updatePopulation } from '../ciudad.actions';

@Component({
  selector: 'app-ciudad',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './ciudad.component.html',
  styleUrl: './ciudad.component.scss'
})
export class CiudadComponent implements OnDestroy {

  ciudad$: Observable<Ciudad | undefined>;

  private disposing$ = new Subject<void>();

  constructor(
    private store: Store,
    route: ActivatedRoute,
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

  updatePopulation(p: { name: string, population: number }) {
    this.store.dispatch(updatePopulation({ name: p.name, population: p.population }));
  }
}
