import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileHeaderComponent } from './header/profile-header';
import { ProfileTabsComponent } from './tabs/profile-tabs';
import { DashboardTabComponent } from './dashboard/dashboard-tab';
import { PersonalInfoTabComponent } from './personal-info/personal-info-tab';
import { OrdersTabComponent } from './orders/orders-tab/orders-tab';
import { ReviewsFavoritesTabComponent } from './reviews-favorites/reviews-favorites-tab';
import { SecurityTabComponent } from './security/security-tab';
import { SellerRequestsTabComponent } from './seller-requests/seller-requests-tab';
import { SellerTabComponent } from './seller/seller-tab/seller-tab';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ProfileHeaderComponent,
    ProfileTabsComponent,
    DashboardTabComponent,
    PersonalInfoTabComponent,
    OrdersTabComponent,
    ReviewsFavoritesTabComponent,
    SecurityTabComponent,
    SellerRequestsTabComponent,
    SellerTabComponent
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent {
  activeTab: 'dashboard' | 'personal' | 'orders' | 'reviews' | 'security' | 'seller-requests' | 'seller' = 'dashboard';

  // recibe el cambio desde ProfileTabsComponent
  onTabChange(tab: string) {
    switch (tab) {
      case 'info-personal':
        this.activeTab = 'personal';
        break;
      case 'historial-pedidos':
        this.activeTab = 'orders';
        break;
      case 'resenas-favoritos':
        this.activeTab = 'reviews';
        break;
      case 'seguridad':
        this.activeTab = 'security';
        break;
      case 'solicitudes-vendedor':
        this.activeTab = 'seller-requests';
        break;
      case 'mi-restaurante':
        this.activeTab = 'seller';
        break;
      default:
        this.activeTab = 'dashboard';
    }
    // scroll to top of content (optional)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
