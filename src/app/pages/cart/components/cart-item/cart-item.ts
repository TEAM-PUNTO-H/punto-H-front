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

  // Verificar si la imagen del item es una URL válida (no un emoji)
  isItemImage(imagen?: string): boolean {
    if (!imagen) return false;
    // Verificar si es una URL válida (http, blob, data) o si es un emoji
    const isUrl = imagen.startsWith('http') || imagen.startsWith('blob:') || imagen.startsWith('data:');
    const isEmoji = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/u.test(imagen);
    return isUrl && !isEmoji;
  }

  // Manejar error al cargar imagen
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    // El emoji se mostrará automáticamente porque isItemImage() retornará false
  }
}

