import { Component } from '@angular/core';
import { Ciudad } from '../ciudad';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ciudades-table',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './ciudades-table.component.html',
  styleUrl: './ciudades-table.component.scss'
})
export class CiudadesTableComponent {
  ciudades: Ciudad[] = [];
}
