import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Restaurant } from '../../restaurant.model';

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './restaurant-detail.html',
  styleUrls: ['./restaurant-detail.css']
})
export class RestaurantDetailComponent {
  @Input() restaurant?: Restaurant;
  @Output() close = new EventEmitter<void>();
  @Output() openDish = new EventEmitter<{rest: Restaurant, dish: string}>();

  closeModal() { this.close.emit(); }
  openDishModal(dishId: string) { if (this.restaurant) this.openDish.emit({rest: this.restaurant, dish: dishId}); }

  getMenuCategories(): string[] {
    return this.restaurant ? Object.keys(this.restaurant.menu) : [];
  }

  getAlergenosText(alergenos?: string[]): string {
    return alergenos && alergenos.length > 0 ? alergenos.join(', ') : '';
  }
}
