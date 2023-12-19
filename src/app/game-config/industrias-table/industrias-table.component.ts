import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { IndustriasNgrxModule, addIndustria, removeIndustria, setMateriaPrima, setMateriaPrimaPerWeek, setProduct, setProductPerWeek } from '../ngrx/industrias.ngrx';
import { allIndustries } from '../ngrx/industrias.ngrx';
import { Industria } from '../ngrx/industrias.ngrx';
import { allGoods } from '../ngrx/goods.ngrx';

@Component({
  selector: 'app-industrias-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IndustriasNgrxModule,
  ],
  templateUrl: './industrias-table.component.html',
  styleUrl: './industrias-table.component.scss'
})
export class IndustriasTableComponent {

  industrias$: Observable<Industria[]>;
  goods$: Observable<string[]>;

  newName?: string;

  constructor(private store: Store) {
    this.industrias$ = store.select(allIndustries);
    this.goods$ = store.select(allGoods);
  }

  addIndustria(name: string) {
    this.store.dispatch(addIndustria({ industria: { name } }));
  }

  removeIndustria(nombre: string) {
    this.store.dispatch(removeIndustria({ nombre }));
  }

  setMaterialPrima(industria: Industria, index: number, good: string) {
    this.store.dispatch(setMateriaPrima({ industria: industria.name, index, good }));
  }

  setMaterialPrimaPerWeek(industria: Industria, index: number, nivel: number, perWeek: number) {
    this.store.dispatch(setMateriaPrimaPerWeek({ industria: industria.name, index, nivel, perWeek }));
  }

  setProduct(industria: Industria, index: number, good: string) {
    this.store.dispatch(setProduct({ industria: industria.name, index, good }));
  }

  setProductosPerWeek(industria: Industria, index: number, nivel: number, perWeek: number) {
    this.store.dispatch(setProductPerWeek({ industria: industria.name, index, nivel, perWeek }));
  }
}
