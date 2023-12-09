import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { NegocioRural } from '../negocio-rural';
import { todosLosNegociosRurales } from '../negocio-rural.state';
import { allGoods } from '../goods.state';
import { Ciudad } from '../ciudad';
import { todosLosCiudades } from '../ciudad.state';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-direct-trains',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './direct-lines.component.html',
  styleUrl: './direct-lines.component.scss'
})
export class DirectLinesComponent {

  rurales$: Observable<NegocioRural[]>;
  goods$: Observable<string[]>;
  ciudades$: Observable<Ciudad[]>;

  newRuralProducer?: NegocioRural;
  newGood?: string;
  newDestinationCity?: Ciudad;
  newMiles?: number;
  newCost?: number;

  constructor(store: Store) {
    this.rurales$ = store.select(todosLosNegociosRurales);
    this.goods$ = store.select(allGoods);
    this.ciudades$ = store.select(todosLosCiudades);
  }

  addLine(p: {ruralProducer: NegocioRural, good: string, destinationCity: Ciudad, miles: number, cost: number }) {
    throw new Error('not implemented');
  }
}
