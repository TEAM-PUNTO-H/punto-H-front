import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../shared/services/cart.service';
import { CartItemComponent } from './components/cart-item/cart-item';
import { CartSummaryComponent } from './components/cart-summary/cart-summary';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CartItemComponent, CartSummaryComponent],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class CartPage implements OnInit {
  constructor(
    public cartService: CartService,
    private router: Router
  ) {}

  get items() {
    return this.cartService.items;
  }

  get subtotal() {
    return this.cartService.subtotal;
  }

  get shipping() {
    return this.cartService.shipping;
  }

  get total() {
    return this.cartService.total;
  }

  get itemCount() {
    return this.cartService.itemCount;
  }

  get estimatedDeliveryTime() {
    return this.cartService.estimatedDeliveryTime;
  }

  ngOnInit(): void {
    // Component initialized
  }

  onIncreaseQty(id: string): void {
    this.cartService.increaseQty(id);
  }

  onDecreaseQty(id: string): void {
    this.cartService.decreaseQty(id);
  }

  onRemoveItem(id: string): void {
    this.cartService.removeItem(id);
  }

  onProceedToCheckout(): void {
    if (this.itemCount() > 0) {
      // Navigate to checkout page (you can create this later)
      // For now, just show an alert
      alert('Redirigiendo al proceso de pago...');
      // this.router.navigate(['/checkout']);
    }
  }

  onClearCart(): void {
    this.cartService.clearCart();
  }

  navigateToCatalog(): void {
    // Close modal if open
    this.cartService.closeModal();
    // Navigate to catalog
    this.router.navigate(['/catalog']);
  }
}
