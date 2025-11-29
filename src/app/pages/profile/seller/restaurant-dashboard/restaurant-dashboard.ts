import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogService } from '../../../catalog/catalog.service';
import type { Restaurant } from '../../../catalog/restaurant.model';

@Component({
  selector: 'app-restaurant-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './restaurant-dashboard.html',
  styleUrls: ['./restaurant-dashboard.css']
})
export class RestaurantDashboardComponent implements OnInit {
  @Output() navigateTo = new EventEmitter<string>();
  @Input() restaurantId: string | null = null;

  restaurante: Restaurant | null = null;

  constructor(private catalogService: CatalogService) {
    // En producción, esto vendría del servicio del usuario vendedor
  }

  ngOnInit() {
    this.loadRestaurant();
    // Suscribirse a cambios
    this.catalogService.restaurants$.subscribe(() => {
      this.loadRestaurant();
    });
  }

  private loadRestaurant() {
    if (this.restaurantId) {
      this.restaurante = this.catalogService.getRestaurantById(this.restaurantId) || null;
    }
  }

  goToDishes() {
    this.navigateTo.emit('dishes');
  }

  goToEditRestaurant() {
    this.navigateTo.emit('edit-restaurant');
  }

  goToOrders() {
    this.navigateTo.emit('orders');
  }

  toggleEstado() {
    if (!this.restaurante || !this.restaurantId) return;
    
    const nuevoEstado = !this.restaurante.abierto;
    this.catalogService.updateRestaurant(this.restaurantId, { abierto: nuevoEstado });
    this.restaurante = this.catalogService.getRestaurantById(this.restaurantId) || null;
    console.log('Estado actualizado:', nuevoEstado ? 'activo' : 'inactivo');
  }

  get estadoTexto(): string {
    return this.restaurante?.abierto ? 'Activo' : 'Inactivo';
  }

  get tipoCocinaTexto(): string {
    return this.restaurante?.tipo?.[0] || 'Sin categoría';
  }

  get tiempoEntregaTexto(): string {
    if (!this.restaurante) return '';
    return `${this.restaurante.tiempoMin}-${this.restaurante.tiempoMax}`;
  }
}

