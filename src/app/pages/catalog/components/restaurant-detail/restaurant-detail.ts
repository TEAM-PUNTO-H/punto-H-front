import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { Restaurant } from '../../restaurant.model';
import { CatalogService } from '../../catalog.service';
import { RestaurantReviewsComponent } from '../restaurant-reviews/restaurant-reviews';

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RestaurantReviewsComponent],
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

  // Verificar si la imagen del plato es una URL válida (no un emoji)
  isDishImage(imagen?: string): boolean {
    if (!imagen) return false;
    // Verificar si es una URL válida (http, blob, data) o si es un emoji
    const isUrl = imagen.startsWith('http') || imagen.startsWith('blob:') || imagen.startsWith('data:');
    const isEmoji = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/u.test(imagen);
    return isUrl && !isEmoji;
  }

  // Manejar error al cargar imagen del plato
  onDishImageError(event: Event, dish: any): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    // El emoji se mostrará automáticamente porque isDishImage() retornará false
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

    // El servicio actualizará automáticamente la calificación, número de reseñas y lista
    this.catalogService.addUserReview(this.restaurant, {
      usuario,
      comentario,
      calificacion,
      fecha: nuevaResena.fecha
    });
    
    // Suscribirse a cambios para actualizar la vista local
    // La calificación y lista se actualizarán automáticamente por el servicio
    setTimeout(() => {
      const updatedRestaurant = this.catalogService.getRestaurantById(this.restaurant!.id);
      if (updatedRestaurant) {
        this.restaurant = updatedRestaurant;
      }
    }, 100);

    this.newReview = { usuario: '', calificacion: 5, comentario: '' };
    this.reviewError = '';
    this.reviewFeedback = '¡Gracias por compartir tu reseña!';
    setTimeout(() => { this.reviewFeedback = ''; }, 3000);
  }
}
