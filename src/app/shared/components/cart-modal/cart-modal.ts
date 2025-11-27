import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { CartPage } from '../../../pages/cart/cart';

@Component({
  selector: 'app-cart-modal',
  standalone: true,
  imports: [CommonModule, CartPage],
  templateUrl: './cart-modal.html',
  styleUrls: ['./cart-modal.css']
})
export class CartModalComponent {
  constructor(public cartService: CartService) {}

  get modalOpen() {
    return this.cartService.modalOpen;
  }

  closeModal(): void {
    this.cartService.closeModal();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal();
    }
  }
}

