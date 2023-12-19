import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { addGood, removeGood } from '../ngrx/goods.ngrx';
import { allGoods } from '../ngrx/goods.ngrx';

@Component({
  selector: 'app-goods-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './goods-table.component.html',
  styleUrl: './goods-table.component.scss'
})
export class GoodsTableComponent {

  goods$: Observable<string[]>;

  newName?: string;

  constructor(private store: Store) {
    this.goods$ = store.select(allGoods);
  }

  addGood(name: string) {
    this.store.dispatch(addGood({ good: name }));
  }

  removeGood(name: string) {
    this.store.dispatch(removeGood({ good: name }));
  }
}
