import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { addIndustria, removeIndustria, setMateriaPrima, setProduct } from '../industrias.actions';
import { allIndustries } from '../industrias.state';
import { Industria } from '../industria';
import { allGoods } from '../goods.state';

@Component({
  selector: 'app-industrias-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
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

  setProduct(industria: Industria, index: number, good: string) {
    this.store.dispatch(setProduct({ industria: industria.name, index, good }));
  }
}
