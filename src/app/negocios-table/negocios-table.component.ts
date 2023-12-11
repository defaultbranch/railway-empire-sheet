import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { Negocio } from '../negocio';
import { todosLosNegocios } from '../negocios.state';
import { allGoods } from '../goods.state';
import { addNegocio, removeNegocio, setProduct, setProductPerWeek } from '../negocios.actions';

@Component({
  selector: 'app-negocios-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './negocios-table.component.html',
  styleUrl: './negocios-table.component.scss'
})
export class NegociosTableComponent {

  negocios$: Observable<Negocio[]>;
  goods$: Observable<string[]>;

  newName?: string;

  constructor(private store: Store) {
    this.negocios$ = store.select(todosLosNegocios);
    this.goods$ = store.select(allGoods);
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
