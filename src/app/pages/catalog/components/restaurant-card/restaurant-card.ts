import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Restaurant } from '../../restaurant.model';

@Component({
  selector: 'app-restaurant-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './restaurant-card.html',
  styleUrls: ['./restaurant-card.css']
})
export class RestaurantCardComponent {
  @Input() restaurant!: Restaurant;
  @Output() openRestaurant = new EventEmitter<Restaurant>();
  @Output() addDish = new EventEmitter<string>(); // message string to show

  // color by type - uses the first type found
  headerColor() {
    const t = this.restaurant.tipo[0];
    switch(t) {
      case 'mexicana': return 'linear-gradient(90deg,#ff5722,#ff9800)';
      case 'vegetariana': return 'linear-gradient(90deg,#4caf50,#2e7d32)';
      case 'cafeteria': return 'linear-gradient(90deg,#6a4e23,#d7a86e)';
      case 'rapida': return 'linear-gradient(90deg,#f44336,#ef5350)';
      case 'japonesa': return 'linear-gradient(90deg,#2196f3,#0288d1)';
      default: return 'linear-gradient(90deg,#9c27b0,#7b1fa2)';
    }
  }

  open() { this.openRestaurant.emit(this.restaurant); }

  addSampleDish() {
    const dish = this.restaurant.menu ? Object.values(this.restaurant.menu).flat().find(d => d.disponible) : null;
    if (dish) this.addDish.emit(`${dish.nombre} agregado al carrito`);
  }

  getFormattedTypes(): string {
    return this.restaurant.tipo.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(' • ');
  }
}
