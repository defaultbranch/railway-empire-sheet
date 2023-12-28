import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable, combineLatest, map } from 'rxjs';
import { Store } from '@ngrx/store';

import { NegocioRural, NegociosRuralesNgrxModule, updateSize } from '../ngrx/negocios-rurales.ngrx';
import { addNegocioRural, removeNegocioRural } from '../ngrx/negocios-rurales.ngrx';
import { todosLosNegociosRurales } from '../ngrx/negocios-rurales.ngrx';
import { Good, allGoods } from '../../game-config/ngrx/goods.ngrx';
import { GameDateComponent } from "../game-date/game-date.component";
import { NegociosNgrxModule, todosLosNegocios } from '../../game-config/ngrx/negocios.ngrx';
import { ruralWithProductionPerWeek } from '../util';

type VM = {
  name: string,
  product: Good,
  size: number,
  perWeek: number,
};

@Component({
  selector: 'app-negocios-rurales-table',
  standalone: true,
  templateUrl: './negocios-rurales-table.component.html',
  styleUrl: './negocios-rurales-table.component.scss',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    GameDateComponent,
    NegociosRuralesNgrxModule,
    NegociosNgrxModule,
  ]
})
export class NegociosRuralesTableComponent {

  items$: Observable<VM[]>;
  itemsSorted$: Observable<VM[]>;

  goods$: Observable<string[]>;

  newName?: string;
  newSize?: number;
  newProduct?: string;

  constructor(private store: Store) {

    this.goods$ = store.select(allGoods);

    this.items$ = combineLatest([
      store.select(todosLosNegociosRurales),
      store.select(todosLosNegocios),
    ], (rurales, negocios) => rurales.map(rural => ruralWithProductionPerWeek(rural, negocios)));
    this.itemsSorted$ = this.items$;
  }

  addNegocio(p: { name: string, size: number, product: string }) {
    this.store.dispatch(addNegocioRural({ negocio: { name: p.name, size: p.size, product: p.product } }));
  }

  removeNegocio(name: string) {
    this.store.dispatch(removeNegocioRural({ nombre: name }));
  }

  sortByName() {
    this.itemsSorted$ = this.items$.pipe(map(it => it.sort((a, b) => a.name.localeCompare(b.name))));
  }

  sortByProduct() {
    this.itemsSorted$ = this.items$.pipe(map(it => it.sort((a, b) => a.product.localeCompare(b.product))));
  }

  updateSize(negocio: NegocioRural, size: number) {
    this.store.dispatch(updateSize({ negocio, size }));
  }
}
