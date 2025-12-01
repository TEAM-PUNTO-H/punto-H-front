import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { CatalogService, FavoriteRestaurant, UserReview } from '../../catalog/catalog.service';
import type { Restaurant } from '../../catalog/restaurant.model';

@Component({
  selector: 'app-reviews-favorites-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reviews-favorites-tab.html',
  styleUrls: ['./reviews-favorites-tab.css']
})
export class ReviewsFavoritesTabComponent implements OnInit, OnDestroy {
  reviews: UserReview[] = [];
  favorites: FavoriteRestaurant[] = [];
  editingReviewId: string | null = null;
  editedReview: Partial<UserReview> = {};
  private subs = new Subscription();

  constructor(private catalogService: CatalogService, private router: Router) {}

  ngOnInit(): void {
    this.subs.add(this.catalogService.reviews$.subscribe(data => this.reviews = data));
    this.subs.add(this.catalogService.favorites$.subscribe(data => this.favorites = data));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  getStars(rating: number): string {
    return '⭐'.repeat(Math.round(rating));
  }

  // Métodos para mostrar calificaciones mejoradas en favoritos
  getRatingAverage(favorite: FavoriteRestaurant): number {
    return favorite.rating || 0;
  }

  getStarRating(favorite: FavoriteRestaurant): { full: number; half: boolean; empty: number } {
    const rating = this.getRatingAverage(favorite);
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5 && rating % 1 < 1;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return { full: fullStars, half: hasHalfStar, empty: emptyStars };
  }

  getTotalReviews(favorite: FavoriteRestaurant): number {
    // Obtener el restaurante completo para obtener el número de reseñas
    const restaurant = this.catalogService.getRestaurantById(favorite.id);
    return restaurant?.resenas || 0;
  }

  getRatingBreakdown(favorite: FavoriteRestaurant): { [key: number]: number } {
    const restaurant = this.catalogService.getRestaurantById(favorite.id);
    if (!restaurant?.resenasList || restaurant.resenasList.length === 0) {
      return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    }

    const breakdown: { [key: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    restaurant.resenasList.forEach(review => {
      const rating = Math.round(review.calificacion);
      if (rating >= 1 && rating <= 5) {
        breakdown[rating] = (breakdown[rating] || 0) + 1;
      }
    });

    return breakdown;
  }

  getRatingPercentage(favorite: FavoriteRestaurant, rating: number): number {
    const total = this.getTotalReviews(favorite);
    if (total === 0) return 0;
    const breakdown = this.getRatingBreakdown(favorite);
    return Math.round((breakdown[rating] / total) * 100);
  }

  startEditing(review: UserReview): void {
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
    if (this.editedReview.title && this.editedReview.text && this.editedReview.rating) {
      this.catalogService.updateUserReview(reviewId, {
        title: this.editedReview.title,
        text: this.editedReview.text,
        rating: this.editedReview.rating
      });
      this.cancelEditing();
    }
  }

  deleteReview(reviewId: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta reseña?')) {
      this.catalogService.deleteUserReview(reviewId);
    }
  }

  isEditing(reviewId: string): boolean {
    return this.editingReviewId === reviewId;
  }

  viewMenu(favorite: FavoriteRestaurant): void {
    this.router.navigate(['/catalog'], { queryParams: { restaurant: favorite.id } });
  }
}

