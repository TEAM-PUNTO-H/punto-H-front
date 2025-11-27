import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import {
  ProfileDataService,
  OrderSummary,
  AccountStats,
  ActivityItem,
  OrderStatus
} from '../services/profile-data.service';

@Component({
  selector: 'app-dashboard-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-tab.html',
  styleUrls: ['./dashboard-tab.css']
})
export class DashboardTabComponent {
  @Output() navigateToTab = new EventEmitter<string>();

  recentOrders$: Observable<OrderSummary[]>;
  accountStats$: Observable<AccountStats>;
  activity$: Observable<ActivityItem[]>;

  constructor(
    private router: Router,
    private profileDataService: ProfileDataService
  ) {
    this.recentOrders$ = this.profileDataService.recentOrders$;
    this.accountStats$ = this.profileDataService.accountStats$;
    this.activity$ = this.profileDataService.activity$;
  }

  goToOrders() {
    this.navigateToTab.emit('historial-pedidos');
  }

  goToReviews() {
    this.navigateToTab.emit('resenas-favoritos');
  }

  goToOrder() {
    this.router.navigate(['/catalog']);
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  getStatusText(status: OrderStatus): string {
    switch (status) {
      case 'preparing':
        return 'En preparación';
      case 'delivered':
        return 'Entregado';
      case 'canceled':
        return 'Cancelado';
      default:
        return status;
    }
  }

  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case 'preparing':
        return 'yellow';
      case 'delivered':
        return 'green';
      case 'canceled':
        return 'red';
      default:
        return '';
    }
  }
}

