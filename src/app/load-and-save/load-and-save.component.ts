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
import { CiudadesNgrxModule, loadCiudades, todosLosCiudades } from '../game-state/ngrx/ciudades.ngrx';
import { NegocioRuralComponent } from '../game-state/negocio-rural/negocio-rural.component';
import { NegociosRuralesNgrxModule, loadNegociosRurales, todosLosNegociosRurales } from '../game-state/ngrx/negocios-rurales.ngrx';
import { DirectLinesNgrxModule, allLines, loadDirectLines } from '../game-state/ngrx/direct-lines.ngrx';

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
    CiudadesNgrxModule,
    NegociosRuralesNgrxModule,
    DirectLinesNgrxModule,
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
    store.dispatch(loadCiudades());
    store.dispatch(loadNegociosRurales());
    store.dispatch(loadDirectLines());
  }

  ngOnInit(): void {

    combineLatest([
      this.store.select(gameDate),
      this.store.select(allGoods),
      this.store.select(todosLosNegocios),
      this.store.select(allIndustries),
      this.store.select(allDemands),
      this.store.select(todosLosCiudades),
      this.store.select(todosLosNegociosRurales),
      this.store.select(allLines),
    ]).pipe(
      map(([
        gameDate,
        goods,
        negocios,
        industrias,
        demands,
        cities,
        localBusinesses,
        directLines,
      ]) => ({
        gameDate,
        goods,
        negocios,
        industrias,
        demands,
        cities,
        localBusinesses,
        directLines
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
