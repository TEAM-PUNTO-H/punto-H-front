import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from './shared/services/cart.service';
import { AuthService } from './services/auth.service';
import { CartModalComponent } from './shared/components/cart-modal/cart-modal';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, CartModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'Mi App de Autenticación';

  // Exponer el servicio directamente para usar el signal en el template
  auth = inject(AuthService);

  constructor(
    public cartService: CartService,
  ) {}

  // Getter para isLoggedIn que retorna el signal directamente
  // Angular detectará automáticamente los cambios del signal en el template
  get isLoggedIn() {
    return this.auth.isLoggedIn;
  }

  get itemCount() {
    return this.cartService.itemCount;
  }

  openCart(): void {
    this.cartService.openModal();
  }
}