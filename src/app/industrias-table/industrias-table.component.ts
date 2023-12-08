import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { addIndustria, removeIndustria } from '../industrias.actions';
import { allIndustries } from '../industrias.state';

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

  industrias$: Observable<string[]>;

  newName?: string;

  constructor(private store: Store) {
    this.industrias$ = store.select(allIndustries);
  }

  addIndustria(name: string) {
    this.store.dispatch(addIndustria({ industria: name }));
  }

  removeIndustria(name: string) {
    this.store.dispatch(removeIndustria({ industria: name }));
  }
}
