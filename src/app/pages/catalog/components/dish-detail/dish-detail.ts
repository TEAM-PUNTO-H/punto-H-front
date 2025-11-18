import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { Dish, Restaurant } from '../../restaurant.model';

@Component({
  selector: 'app-dish-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dish-detail.html',
  styleUrls: ['./dish-detail.css']
})
export class DishDetailComponent {
  @Input() dish?: Dish;
  @Input() restaurant?: Restaurant;
  @Output() close = new EventEmitter<void>();
  @Output() add = new EventEmitter<string>();

  cantidad = 1;
  picante = 'no';
  instrucciones = '';

  closeModal() { this.close.emit(); }

  aumentar(delta: number) { this.cantidad = Math.max(1, this.cantidad + delta); }

  getTotalPrice(): number {
    return this.dish ? this.dish.precio * this.cantidad : 0;
  }

  addToCart() {
    const text = `${this.cantidad}x ${this.dish?.nombre} agregado${this.instrucciones ? ' con instrucciones' : ''}${this.picante !== 'no' ? ' • Picante: '+this.picante : ''}`;
    this.add.emit(text);
    this.close.emit();
  }
}
