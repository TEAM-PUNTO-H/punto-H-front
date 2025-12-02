import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from './shared/services/cart.service';
import { AuthService } from './services/auth.service';
import { CartModalComponent } from './shared/components/cart-modal/cart-modal';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, CartModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'Mi App de Autenticación';

  constructor(
    public cartService: CartService,
  ) {}

  private auth = inject(AuthService);

  get itemCount() {
    return this.cartService.itemCount;
  }

  get isLoggedIn() {
    return this.auth.isLoggedIn();
  }

  openCart(): void {
    this.cartService.openModal();
  }
}
