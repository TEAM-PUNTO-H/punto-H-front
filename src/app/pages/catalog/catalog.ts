import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CatalogService } from './catalog.service';
import type { Restaurant, Dish } from './restaurant.model';

import { RestaurantCardComponent } from './components/restaurant-card/restaurant-card';
import { RestaurantDetailComponent } from './components/restaurant-detail/restaurant-detail';
import { DishDetailComponent } from './components/dish-detail/dish-detail';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RestaurantCardComponent, RestaurantDetailComponent, DishDetailComponent],
  templateUrl: './catalog.html',
  styleUrls: ['./catalog.css'],
  providers: [CatalogService]
})
export class CatalogPage {
  allRestaurants: Restaurant[] = [];
  restaurants: Restaurant[] = [];

  // filtros / UI state
  searchTerm = '';
  orden = 'recomendados';
  filtrosTipo: Set<string> = new Set();
  precio = 'todos';
  calificacion = 0;
  tiempo = 0;
  soloPromociones = false;
  filtrosRapidos = { abierto: false, delivery: false, nuevo: false };

  // modales
  showRestaurantDetail = false;
  selectedRestaurant?: Restaurant;

  showDishDetail = false;
  selectedDish?: Dish;
  selectedDishRestaurant?: Restaurant;

  // notifications
  notificationText = '';
  showNotificationFlag = false;

  // filtros avanzados
  showAdvancedFilters = false;

  constructor(private svc: CatalogService) {
    this.allRestaurants = this.svc.getRestaurants();
    this.restaurants = [...this.allRestaurants];
    this.applyAll();
  }

  // UI helpers
  applyAll() {
    this.restaurants = this.allRestaurants.filter(r => {
      // search in restaurant name and dishes
      const q = this.searchTerm.trim().toLowerCase();
      if (q) {
        const inName = r.nombre.toLowerCase().includes(q);
        const inDish = Object.values(r.menu).flat().some(d => d.nombre.toLowerCase().includes(q));
        if (!inName && !inDish) return false;
      }

      // tipo
      if (this.filtrosTipo.size > 0 && ![...this.filtrosTipo].some(t => r.tipo.includes(t))) return false;

      // precio
      if (this.precio !== 'todos' && r.rangoPrecios !== this.precio) return false;

      // calificacion
      if (r.calificacion < this.calificacion) return false;

      // tiempo
      if (this.tiempo > 0 && r.tiempoMax > this.tiempo) return false;

      // promociones
      if (this.soloPromociones && !r.promocion) return false;

      // filtros rapidos
      if (this.filtrosRapidos.abierto && !r.abierto) return false;
      if (this.filtrosRapidos.delivery && r.costoEnvio !== 0) return false;
      if (this.filtrosRapidos.nuevo && !r.nuevo) return false;

      return true;
    });

    this.applySort();
  }

  applySort() {
    switch (this.orden) {
      case 'calificacion':
        this.restaurants.sort((a,b)=> b.calificacion - a.calificacion);
        break;
      case 'rapido':
        this.restaurants.sort((a,b)=> a.tiempoMax - b.tiempoMax);
        break;
      case 'barato':
        this.restaurants.sort((a,b)=> a.precioPromedio - b.precioPromedio);
        break;
      case 'recomendados':
      default:
        this.restaurants.sort((a,b)=> {
          const scoreA = a.calificacion + (a.promocion ? 0.5:0) + (a.nuevo ? 0.3:0);
          const scoreB = b.calificacion + (b.promocion ? 0.5:0) + (b.nuevo ? 0.3:0);
          return scoreB - scoreA;
        });
    }
  }

  toggleFiltroTipo(tipo: string) {
    if (this.filtrosTipo.has(tipo)) this.filtrosTipo.delete(tipo);
    else this.filtrosTipo.add(tipo);
    this.applyAll();
  }

  setPrecio(val: string) { this.precio = val; this.applyAll(); }
  setCalificacion(val: number) { this.calificacion = val; this.applyAll(); }
  setTiempo(val: number) { this.tiempo = val; this.applyAll(); }
  togglePromociones() { this.soloPromociones = !this.soloPromociones; this.applyAll(); }

  toggleFiltroRapido(key: 'abierto'|'delivery'|'nuevo') {
    this.filtrosRapidos[key] = !this.filtrosRapidos[key];
    this.applyAll();
  }

  limpiarFiltros() {
    this.searchTerm = '';
    this.filtrosTipo.clear();
    this.precio = 'todos';
    this.calificacion = 0;
    this.tiempo = 0;
    this.soloPromociones = false;
    this.filtrosRapidos = { abierto: false, delivery: false, nuevo: false };
    this.orden = 'recomendados';
    this.applyAll();
  }

  // modales
  openRestaurant(rest: Restaurant) {
    this.selectedRestaurant = rest;
    this.showRestaurantDetail = true;
  }
  closeRestaurant() {
    this.showRestaurantDetail = false;
    this.selectedRestaurant = undefined;
  }

  openDish(rest: Restaurant, dishId: string) {
    const found = Object.values(rest.menu).flat().find(d => d.id === dishId);
    if (found) {
      this.selectedDish = found;
      this.selectedDishRestaurant = rest;
      this.showDishDetail = true;
    }
  }
  closeDish() {
    this.showDishDetail = false;
    this.selectedDish = undefined;
    this.selectedDishRestaurant = undefined;
  }

  agregarAlCarritoMsg(text: string) {
    this.notificationText = text;
    this.showNotificationFlag = true;
    setTimeout(()=> this.showNotificationFlag = false, 3000);
  }
}
