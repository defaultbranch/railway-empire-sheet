import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { Negocio, NegociosNgrxModule, allNegocioKeys, negocio } from '../ngrx/negocios.ngrx';
import { allGoods } from '../ngrx/goods.ngrx';
import { addNegocio, removeNegocio, setProduct, setProductPerWeek } from '../ngrx/negocios.ngrx';

@Component({
  selector: 'app-negocios-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NegociosNgrxModule,
  ],
  templateUrl: './negocios-table.component.html',
  styleUrl: './negocios-table.component.scss'
})
export class NegociosTableComponent {

  keys$: Observable<string[]>;
  goods$: Observable<string[]>;

  newName?: string;

  constructor(private store: Store) {
    this.keys$ = store.select(allNegocioKeys);
    this.goods$ = store.select(allGoods);
  }

  negocio$(key: string) {
    return this.store.select(negocio(key));
  }

  addNegocio(name: string) {
    this.store.dispatch(addNegocio({ negocio: { name } }));
  }

  removeNegocio(name: string) {
    this.store.dispatch(removeNegocio({ name }));
  }

  setProduct(negocio: Negocio, index: number, good: string) {
    this.store.dispatch(setProduct({ negocio: negocio.name, index, good }));
  }

  setProductosPerWeek(negocio: Negocio, index: number, nivel: number, perWeek: number) {
    this.store.dispatch(setProductPerWeek({ negocio: negocio.name, index, nivel, perWeek }));
  }

}
