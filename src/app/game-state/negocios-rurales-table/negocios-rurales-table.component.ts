import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable, map } from 'rxjs';
import { Store } from '@ngrx/store';

import { NegocioRural, NegociosRuralesNgrxModule, updateSize } from '../ngrx/negocios-rurales.ngrx';
import { addNegocioRural, removeNegocioRural } from '../ngrx/negocios-rurales.ngrx';
import { todosLosNegociosRurales } from '../ngrx/negocios-rurales.ngrx';
import { Good, allGoods } from '../../game-config/ngrx/goods.ngrx';
import { GameDateComponent } from "../game-date/game-date.component";
import { NegociosNgrxModule } from '../../game-config/ngrx/negocios.ngrx';
import { productionPerWeek } from '../ngrx/computations';

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

  items$: Observable<NegocioRural[]>;
  itemsSorted$: Observable<NegocioRural[]>;

  goods$: Observable<string[]>;

  newName?: string;
  newSize?: number;
  newProduct?: string;

  constructor(private store: Store) {

    this.goods$ = store.select(allGoods);

    this.items$ = store.select(todosLosNegociosRurales);
    this.itemsSorted$ = this.items$;
  }

  readonly productionPerWeek$ = (producerName: string, good: Good) => this.store.select(productionPerWeek(producerName, good));

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
