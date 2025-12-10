import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-profile-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-tabs.html',
  styleUrls: ['./profile-tabs.css']
})
export class ProfileTabsComponent implements OnChanges {
  @Output() tabChange = new EventEmitter<string>();
  @Input() currentTab: string = 'dashboard';
  active = 'dashboard';

  constructor(private auth: AuthService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentTab']) {
      // Sincronizar el estado activo basado en el tab actual del padre
      this.updateActiveFromCurrentTab();
    }
  }

  private updateActiveFromCurrentTab() {
    switch (this.currentTab) {
      case 'dashboard':
        this.active = 'dashboard';
        break;
      case 'personal':
        this.active = 'info-personal';
        break;
      case 'reviews':
        this.active = 'resenas-favoritos';
        break;
      case 'security':
        this.active = 'seguridad';
        break;
      case 'seller-requests':
        this.active = 'solicitudes-vendedor';
        break;
      case 'seller':
        this.active = 'mi-restaurante';
        break;
      default:
        this.active = 'dashboard';
    }
  }

  setTab(key: string) {
    this.active = key;
    this.tabChange.emit(key);
  }

  get role(): string | null {
    return this.auth.userRole();
  }

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  get showSellerRequestsTab(): boolean {
    if (!this.isLoggedIn) return false;
    const role = this.role;
    return role === 'moderador' || role === 'admin' || role === 'administrador';
  }

  get showSellerTab(): boolean {
    if (!this.isLoggedIn) return false;
    const role = this.role;
    // Vendedor, moderador o administrador pueden ver "Mi restaurante"
    return role === 'vendedor' || this.showSellerRequestsTab;
  }
}