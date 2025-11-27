import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-summary.html',
  styleUrls: ['./cart-summary.css']
})
export class CartSummaryComponent {
  @Input() subtotal: number = 0;
  @Input() shipping: number = 0;
  @Input() totalItems: number = 0;
  @Input() estimatedDeliveryTime: string = '30-45 min';
  
  @Output() proceed = new EventEmitter<void>();
  @Output() clearCart = new EventEmitter<void>();

  onProceed(): void {
    this.proceed.emit();
  }

  onClearCart(): void {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      this.clearCart.emit();
    }
  }

  getShippingDisplay(): string {
    return this.shipping === 0 ? 'Gratis' : `$${this.shipping.toFixed(2)}`;
  }
}

