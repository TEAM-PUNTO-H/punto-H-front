import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { CartItem } from '../../../../shared/services/cart.service';

@Component({
  selector: 'app-cart-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-item.html',
  styleUrls: ['./cart-item.css']
})
export class CartItemComponent {
  @Input() item!: CartItem;
  @Output() increase = new EventEmitter<string>();
  @Output() decrease = new EventEmitter<string>();
  @Output() remove = new EventEmitter<string>();

  onIncrease(): void {
    this.increase.emit(this.item.id);
  }

  onDecrease(): void {
    this.decrease.emit(this.item.id);
  }

  onRemove(): void {
    this.remove.emit(this.item.id);
  }

  getTotalPrice(): number {
    return this.item.price * this.item.quantity;
  }
}

