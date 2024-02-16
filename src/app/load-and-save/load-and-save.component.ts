import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReplaySubject, Subject, combineLatest, map, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import JSONEditor, { JSONEditorOptions } from 'jsoneditor';

import { GoodsNgrxModule, allGoods, loadGoods } from '../game-config/ngrx/goods.ngrx';
import { NegociosNgrxModule, loadNegocios, todosLosNegocios } from '../game-config/ngrx/negocios.ngrx';
import { GameDateNgrxModule, gameDate, loadGameDate } from '../game-state/ngrx/game-date.ngrx';
import { IndustriasNgrxModule, allIndustries, loadIndustrias } from '../game-config/ngrx/industrias.ngrx';
import { DemandsNgrxModule, allDemands, loadDemands } from '../game-config/ngrx/demands.ngrx';

@Component({
  selector: 'app-load-and-save',
  standalone: true,
  imports: [
    CommonModule,
    GameDateNgrxModule,
    GoodsNgrxModule,
    NegociosNgrxModule,
    IndustriasNgrxModule,
    DemandsNgrxModule,
  ],
  templateUrl: './load-and-save.component.html',
  styleUrl: './load-and-save.component.scss'
})
export class LoadAndSaveComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('jsonEditor') private jsonEditorRef?: ElementRef<HTMLElement>;

  private data$ = new ReplaySubject<unknown>(1);
  private document$ = new ReplaySubject<string>(1);

  private disposing$ = new Subject<unknown>();

  constructor(private readonly store: Store) {
    store.dispatch(loadGameDate());
    store.dispatch(loadGoods());
    store.dispatch(loadNegocios());
    store.dispatch(loadIndustrias());
    store.dispatch(loadDemands());
  }

  ngOnInit(): void {

    combineLatest([
      this.store.select(gameDate),
      this.store.select(allGoods),
      this.store.select(todosLosNegocios),
      this.store.select(allIndustries),
      this.store.select(allDemands),
    ]).pipe(
      map(([
        gameDate,
        goods,
        negocios,
        industrias,
        demands,
      ]) => ({
        gameDate: gameDate,
        goods: goods,
        negocios: negocios,
        industrias: industrias,
        demands: demands,
      })),
      takeUntil(this.disposing$)
    ).subscribe(it => this.data$.next(it));

    this.data$.pipe(
      takeUntil(this.disposing$)
    ).subscribe(it =>
      this.document$.next(JSON.stringify(it))
    );
  }

  ngAfterViewInit(): void {

    if (this.jsonEditorRef) {
      const options = {
        mode: 'code',
        onEditable: () => false,

      } satisfies JSONEditorOptions;
      const editor = new JSONEditor(this.jsonEditorRef.nativeElement, options)
      this.data$.pipe(
        takeUntil(this.disposing$)
      ).subscribe(json => editor.set(json));
    }
  }

  ngOnDestroy(): void {
    this.disposing$.next(undefined);
  }

}
