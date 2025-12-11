import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { ProfileHeaderComponent } from './header/profile-header';
import { ProfileTabsComponent } from './tabs/profile-tabs';
import { DashboardTabComponent } from './dashboard/dashboard-tab';
import { PersonalInfoTabComponent } from './personal-info/personal-info-tab';
import { ReviewsFavoritesTabComponent } from './reviews-favorites/reviews-favorites-tab';
import { SecurityTabComponent } from './security/security-tab';
import { SellerRequestsTabComponent } from './seller-requests/seller-requests-tab';
import { SellerTabComponent } from './seller/seller-tab/seller-tab';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ProfileHeaderComponent,
    ProfileTabsComponent,
    DashboardTabComponent,
    PersonalInfoTabComponent,
    ReviewsFavoritesTabComponent,
    SecurityTabComponent,
    SellerRequestsTabComponent,
    SellerTabComponent
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  activeTab: 'dashboard' | 'personal' | 'reviews' | 'security' | 'seller-requests' | 'seller' = 'dashboard';

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const tab = params.get('tab');
      if (tab === 'seller') {
        this.activeTab = 'seller';
        return;
      }
      if (tab === 'seller-requests') {
        this.activeTab = 'seller-requests';
        return;
      }

      // Si no se especifica tab por query param, elegir por defecto según el rol
      const role = this.auth.userRole();
      if (role === 'vendedor') {
        this.activeTab = 'seller';
      } else if (role === 'admin' || role === 'administrador' || role === 'moderador') {
        // Los admins también pueden acceder a "Mi restaurante"
        this.activeTab = 'seller';
      } else {
        this.activeTab = 'dashboard';
      }
    });
  }

  // recibe el cambio desde ProfileTabsComponent
  onTabChange(tab: string) {
    switch (tab) {
      case 'info-personal':
        this.activeTab = 'personal';
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