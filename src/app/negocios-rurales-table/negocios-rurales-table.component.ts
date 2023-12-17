import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, map } from 'rxjs';
import { Store } from '@ngrx/store';

import { NegocioRural } from '../negocios-rurales';
import { addNegocioRural, removeNegocioRural, updateNegocioRural } from '../negocios-rurales';
import { todosLosNegociosRurales } from '../negocios-rurales';
import { allGoods } from '../ngrx/goods.ngrx';

@Component({
  selector: 'app-negocios-rurales-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './negocios-rurales-table.component.html',
  styleUrl: './negocios-rurales-table.component.scss'
})
export class NegociosRuralesTableComponent {

  negocios$: Observable<NegocioRural[]>;
  negociosSorted$: Observable<NegocioRural[]>;
  goods$: Observable<string[]>;

  newName?: string;
  newSize?: number;
  newProduct?: string;
  newPerWeek?: number;

  constructor(private store: Store) {
    this.negocios$ = store.select(todosLosNegociosRurales);
    this.negociosSorted$ = this.negocios$;
    this.goods$ = store.select(allGoods);
  }

  addNegocio(p: { name: string, size: number, product: string, perWeek: number }) {
    this.store.dispatch(addNegocioRural({ negocio: { name: p.name, size: p.size, product: p.product, perWeek: p.perWeek } }));
  }

  removeNegocio(name: string) {
    this.store.dispatch(removeNegocioRural({ nombre: name }));
  }

  sortByName() {
    this.negociosSorted$ = this.negocios$.pipe(map(it => it.sort((a, b) => a.name.localeCompare(b.name))));
  }

  sortByProduct() {
    this.negociosSorted$ = this.negocios$.pipe(map(it => it.sort((a, b) => a.product.localeCompare(b.product))));
  }

  updateWeeklyProduction(p: { negocio: NegocioRural, perWeek: number }) {
    this.store.dispatch(updateNegocioRural({ negocio: p.negocio, perWeek: p.perWeek }));
  }
}
