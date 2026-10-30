import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { gameDate } from '../ngrx/game-date.ngrx';
import { setGameDate } from '../ngrx/game-date.ngrx';

@Component({
  selector: 'app-game-date',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './game-date.component.html',
  styleUrl: './game-date.component.scss'
})
export class GameDateComponent {

  date$: Observable<string>;

  constructor(private store: Store) {
    this.date$ = store.select(gameDate);
  }

  setDate(date: string) {
    this.store.dispatch(setGameDate({ date }));
  }
}
