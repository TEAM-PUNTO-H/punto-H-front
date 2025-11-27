import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { CatalogService, FavoriteRestaurant, UserReview } from '../../catalog/catalog.service';

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

