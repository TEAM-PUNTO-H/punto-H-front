import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { Restaurant } from '../../restaurant.model';
import { CatalogService } from '../../catalog.service';

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './restaurant-detail.html',
  styleUrls: ['./restaurant-detail.css']
})
export class RestaurantDetailComponent implements OnChanges {
  @Input() restaurant?: Restaurant;
  @Output() close = new EventEmitter<void>();
  @Output() openDish = new EventEmitter<{rest: Restaurant, dish: string}>();

  isFavorite = false;
  newReview = {
    usuario: '',
    calificacion: 5,
    comentario: ''
  };
  reviewFeedback = '';
  reviewError = '';
  favoriteMessage = '';

  constructor(private catalogService: CatalogService) {}

  closeModal() { this.close.emit(); }
  openDishModal(dishId: string) { if (this.restaurant) this.openDish.emit({rest: this.restaurant, dish: dishId}); }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['restaurant'] && this.restaurant) {
      this.isFavorite = this.catalogService.isRestaurantFavorite(this.restaurant.id);
    }
  }

  getMenuCategories(): string[] {
    return this.restaurant ? Object.keys(this.restaurant.menu) : [];
  }

  getAlergenosText(alergenos?: string[]): string {
    return alergenos && alergenos.length > 0 ? alergenos.join(', ') : '';
  }

  toggleFavorite(event: Event) {
    event.stopPropagation();
    if (!this.restaurant) { return; }
    this.isFavorite = !this.isFavorite;
    this.catalogService.setFavorite(this.restaurant, this.isFavorite);
    this.favoriteMessage = this.isFavorite
      ? 'Se añadió el restaurante a tus favoritos.'
      : 'El restaurante se quitó de tus favoritos.';
    setTimeout(() => { this.favoriteMessage = ''; }, 3000);
  }

  submitReview() {
    if (!this.restaurant) { return; }

    const usuario = this.newReview.usuario.trim();
    const comentario = this.newReview.comentario.trim();
    const calificacion = Number(this.newReview.calificacion);

    if (!usuario || !comentario) {
      this.reviewError = 'Por favor completa tu nombre y comentario.';
      this.reviewFeedback = '';
      return;
    }

    const nuevaResena = {
      usuario,
      comentario,
      calificacion,
      fecha: new Date().toLocaleDateString()
    };

    if (!this.restaurant.resenasList) {
      this.restaurant.resenasList = [];
    }

    this.restaurant.resenasList = [nuevaResena, ...this.restaurant.resenasList];
    this.restaurant.resenas = (this.restaurant.resenas ?? 0) + 1;
    this.catalogService.addUserReview(this.restaurant, {
      usuario,
      comentario,
      calificacion,
      fecha: nuevaResena.fecha
    });

    this.newReview = { usuario: '', calificacion: 5, comentario: '' };
    this.reviewError = '';
    this.reviewFeedback = '¡Gracias por compartir tu reseña!';
    setTimeout(() => { this.reviewFeedback = ''; }, 3000);
  }
}
