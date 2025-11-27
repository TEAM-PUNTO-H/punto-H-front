import { Component, Input, OnChanges, SimpleChanges, DoCheck, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { Restaurant } from '../../restaurant.model';

export interface Review {
  usuario: string;
  calificacion: number;
  comentario: string;
  fecha: string;
}

type SortOption = 'recent' | 'useful' | 'best' | 'worst';

@Component({
  selector: 'app-restaurant-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './restaurant-reviews.html',
  styleUrls: ['./restaurant-reviews.css']
})
export class RestaurantReviewsComponent implements OnChanges, DoCheck {
  @Input() restaurant?: Restaurant;
  @Input() showAnonymousAs: string = 'Usuario Anónimo';

  allReviews: Review[] = [];
  filteredReviews: Review[] = [];
  displayedReviews: Review[] = [];
  
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  sortOption: SortOption = 'recent';
  minRating = 1;
  maxRating = 5;
  selectedMinRating = 1;
  selectedMaxRating = 5;

  private lastReviewsLength = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['restaurant']) {
      if (this.restaurant) {
        this.loadReviews();
      } else {
        this.allReviews = [];
        this.filteredReviews = [];
        this.displayedReviews = [];
        this.currentPage = 1;
        this.totalPages = 1;
      }
    }
  }

  ngDoCheck(): void {
    // Check if reviews list has changed (for when new reviews are added)
    if (this.restaurant?.resenasList) {
      const currentLength = this.restaurant.resenasList.length;
      if (currentLength !== this.lastReviewsLength) {
        this.lastReviewsLength = currentLength;
        this.loadReviews();
      }
    }
  }

  loadReviews(): void {
    if (!this.restaurant?.resenasList) {
      this.allReviews = [];
    } else {
      this.allReviews = [...this.restaurant.resenasList];
    }
    this.applyFiltersAndSort();
  }

  applyFiltersAndSort(): void {
    // Apply rating filter
    this.filteredReviews = this.allReviews.filter(review => 
      review.calificacion >= this.selectedMinRating && 
      review.calificacion <= this.selectedMaxRating
    );

    // Apply sorting
    this.filteredReviews = [...this.filteredReviews].sort((a, b) => {
      switch (this.sortOption) {
        case 'recent':
          // Sort by date (most recent first)
          return this.compareDates(b.fecha, a.fecha);
        case 'best':
          // Sort by rating (highest first), then by date
          if (b.calificacion !== a.calificacion) {
            return b.calificacion - a.calificacion;
          }
          return this.compareDates(b.fecha, a.fecha);
        case 'worst':
          // Sort by rating (lowest first), then by date
          if (a.calificacion !== b.calificacion) {
            return a.calificacion - b.calificacion;
          }
          return this.compareDates(b.fecha, a.fecha);
        case 'useful':
          // For now, sort by rating and length of comment (longer = more useful)
          // In a real app, this would use helpful votes
          const aUseful = a.calificacion * 10 + a.comentario.length;
          const bUseful = b.calificacion * 10 + b.comentario.length;
          if (bUseful !== aUseful) {
            return bUseful - aUseful;
          }
          return this.compareDates(b.fecha, a.fecha);
        default:
          return 0;
      }
    });

    // Update pagination
    this.totalPages = Math.ceil(this.filteredReviews.length / this.itemsPerPage);
    this.currentPage = 1;
    this.updateDisplayedReviews();
  }

  compareDates(dateA: string, dateB: string): number {
    // Simple date comparison - assumes dates are in format like "11/15/2024"
    const a = new Date(dateA);
    const b = new Date(dateB);
    return b.getTime() - a.getTime();
  }

  updateDisplayedReviews(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.displayedReviews = this.filteredReviews.slice(start, end);
  }

  onSortChange(): void {
    this.applyFiltersAndSort();
  }

  onRatingFilterChange(): void {
    // Ensure min <= max
    if (this.selectedMinRating > this.selectedMaxRating) {
      this.selectedMinRating = this.selectedMaxRating;
    }
    this.applyFiltersAndSort();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedReviews();
    }
  }

  getDisplayName(usuario: string): string {
    return usuario.trim() || this.showAnonymousAs;
  }

  getStarRating(rating: number): string {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  }

  getPages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
}

