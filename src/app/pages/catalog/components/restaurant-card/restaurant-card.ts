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

  // Métodos para mostrar calificaciones
  getRatingAverage(): number {
    return this.restaurant.calificacion || 0;
  }

  getTotalReviews(): number {
    return this.restaurant.resenas || 0;
  }

  getStarRating(): { full: number; half: boolean; empty: number } {
    const rating = this.getRatingAverage();
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5 && rating % 1 < 1;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return { full: fullStars, half: hasHalfStar, empty: emptyStars };
  }

  getRatingBreakdown(): { [key: number]: number } {
    if (!this.restaurant.resenasList || this.restaurant.resenasList.length === 0) {
      return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    }

    const breakdown: { [key: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    this.restaurant.resenasList.forEach(review => {
      const rating = Math.round(review.calificacion);
      if (rating >= 1 && rating <= 5) {
        breakdown[rating] = (breakdown[rating] || 0) + 1;
      }
    });

    return breakdown;
  }

  getRatingPercentage(rating: number): number {
    const total = this.getTotalReviews();
    if (total === 0) return 0;
    const breakdown = this.getRatingBreakdown();
    return Math.round((breakdown[rating] / total) * 100);
  }

  // Obtener la imagen del restaurante (prioridad: galeria[0], luego emoji)
  getRestaurantImage(): string | null {
    if (this.restaurant.galeria && this.restaurant.galeria.length > 0) {
      const firstImage = this.restaurant.galeria[0];
      // Si es una URL válida (no emoji), retornarla
      if (firstImage && !this.isEmoji(firstImage) && this.isValidImageUrl(firstImage)) {
        return firstImage;
      }
    }
    return null;
  }

  // Verificar si un string es un emoji
  private isEmoji(str: string): boolean {
    // Verificar si es un emoji común o un string muy corto que probablemente sea emoji
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/u;
    return emojiRegex.test(str) || (str.length <= 2 && !str.startsWith('http') && !str.startsWith('blob:') && !str.startsWith('data:'));
  }

  // Verificar si es una URL válida de imagen
  private isValidImageUrl(str: string): boolean {
    return str.startsWith('http') || str.startsWith('blob:') || str.startsWith('data:');
  }

  // Manejar error al cargar imagen
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    // El emoji se mostrará automáticamente porque getRestaurantImage() retornará null
  }
}
