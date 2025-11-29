import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogService } from '../../../catalog/catalog.service';
import type { Restaurant, Dish as CatalogDish } from '../../../catalog/restaurant.model';

export interface Dish {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  nivelPicante: 'ninguno' | 'bajo' | 'medio' | 'alto';
}

@Component({
  selector: 'app-dishes-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dishes-list.html',
  styleUrls: ['./dishes-list.css']
})
export class DishesListComponent implements OnInit {
  @Output() navigateTo = new EventEmitter<string>();
  @Output() editDish = new EventEmitter<string>();
  @Output() deleteDish = new EventEmitter<string>();
  @Input() restaurantId: string | null = null;

  platos: Dish[] = [];

  constructor(private catalogService: CatalogService) {}

  ngOnInit() {
    this.loadDishes();
    // Suscribirse a cambios en los restaurantes
    this.catalogService.restaurants$.subscribe(() => {
      this.loadDishes();
    });
  }

  private loadDishes() {
    if (!this.restaurantId) {
      this.platos = [];
      return;
    }

    const restaurant = this.catalogService.getRestaurantById(this.restaurantId);
    if (!restaurant || !restaurant.menu) {
      this.platos = [];
      return;
    }

    // Convertir platos del catálogo al formato de la lista
    const allDishes = Object.values(restaurant.menu).flat();
    this.platos = allDishes.map(d => ({
      id: d.id,
      nombre: d.nombre,
      descripcion: d.descripcion || '',
      precio: d.precio,
      imagen: d.imagen || '🍽️',
      nivelPicante: this.getPicanteFromImage(d.imagen || '')
    }));
  }

  private getPicanteFromImage(imagen: string): 'ninguno' | 'bajo' | 'medio' | 'alto' {
    if (imagen.includes('🟢')) return 'ninguno';
    if (imagen.includes('🟡')) return 'bajo';
    if (imagen.includes('🟠')) return 'medio';
    if (imagen.includes('🔴')) return 'alto';
    return 'ninguno';
  }

  goToAddDish() {
    this.navigateTo.emit('add-dish');
  }

  onEdit(id: string) {
    this.editDish.emit(id);
  }

  onDelete(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este plato?')) {
      this.deleteDish.emit(id);
      // La lista se actualizará automáticamente por la suscripción
    }
  }

  getPicanteIcon(nivel: string): string {
    switch (nivel) {
      case 'ninguno': return '🟢';
      case 'bajo': return '🟡';
      case 'medio': return '🟠';
      case 'alto': return '🔴';
      default: return '🟢';
    }
  }

  getPicanteText(nivel: string): string {
    switch (nivel) {
      case 'ninguno': return 'Sin picante';
      case 'bajo': return 'Picante bajo';
      case 'medio': return 'Picante medio';
      case 'alto': return 'Picante alto';
      default: return 'Sin picante';
    }
  }
}

