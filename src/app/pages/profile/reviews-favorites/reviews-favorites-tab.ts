import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Review {
  id: string;
  title: string;
  rating: number;
  date: string;
  text: string;
}

@Component({
  selector: 'app-reviews-favorites-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reviews-favorites-tab.html',
  styleUrls: ['./reviews-favorites-tab.css']
})
export class ReviewsFavoritesTabComponent {
  // ejemplos
  reviews: Review[] = [
    { id: 'tacos-001', title: 'Tacos El Estudiante', rating: 5, date: '14 Nov 2024', text: 'Excelente sabor...' },
    { id: 'bowls-001', title: 'Bowls Saludables', rating: 5, date: '12 Nov 2024', text: 'Ingredientes frescos...' }
  ];

  favorites = [
    { id: 'tacos', name: 'Tacos El Estudiante', rating: 4.8 },
    { id: 'bowls', name: 'Bowls Saludables', rating: 4.9 }
  ];

  editingReviewId: string | null = null;
  editedReview: Partial<Review> = {};

  getStars(rating: number): string {
    return '⭐'.repeat(Math.round(rating));
  }

  startEditing(review: Review): void {
    this.editingReviewId = review.id;
    this.editedReview = {
      title: review.title,
      rating: review.rating,
      text: review.text
    };
  }

  cancelEditing(): void {
    this.editingReviewId = null;
    this.editedReview = {};
  }

  saveReview(reviewId: string): void {
    const reviewIndex = this.reviews.findIndex(r => r.id === reviewId);
    if (reviewIndex !== -1 && this.editedReview.title && this.editedReview.text && this.editedReview.rating) {
      this.reviews[reviewIndex] = {
        ...this.reviews[reviewIndex],
        title: this.editedReview.title,
        rating: this.editedReview.rating,
        text: this.editedReview.text,
        date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
      };
    }
    this.cancelEditing();
  }

  deleteReview(reviewId: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta reseña?')) {
      this.reviews = this.reviews.filter(r => r.id !== reviewId);
    }
  }

  isEditing(reviewId: string): boolean {
    return this.editingReviewId === reviewId;
  }
}

