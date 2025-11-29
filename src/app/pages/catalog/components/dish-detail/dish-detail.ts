import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { Dish, Restaurant } from '../../restaurant.model';
import { CartService } from '../../../../shared/services/cart.service';

@Component({
  selector: 'app-dish-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dish-detail.html',
  styleUrls: ['./dish-detail.css']
})
export class DishDetailComponent {
  @Input() dish?: Dish;
  @Input() restaurant?: Restaurant;
  @Output() close = new EventEmitter<void>();
  @Output() add = new EventEmitter<string>();

  cantidad = 1;
  picante = 'no';
  instrucciones = '';

  constructor(private cartService: CartService) {}

  closeModal() { this.close.emit(); }

  aumentar(delta: number) { this.cantidad = Math.max(1, this.cantidad + delta); }

  getTotalPrice(): number {
    return this.dish ? this.dish.precio * this.cantidad : 0;
  }

  // Verificar si la imagen del plato es una URL válida (no un emoji)
  isDishImage(imagen?: string): boolean {
    if (!imagen) return false;
    // Verificar si es una URL válida (http, blob, data) o si es un emoji
    const isUrl = imagen.startsWith('http') || imagen.startsWith('blob:') || imagen.startsWith('data:');
    const isEmoji = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/u.test(imagen);
    return isUrl && !isEmoji;
  }

  // Manejar error al cargar imagen del plato
  onDishImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    // El emoji se mostrará automáticamente porque isDishImage() retornará false
  }

  addToCart() {
    if (!this.dish || !this.restaurant) return;

    // Add to cart service
    this.cartService.addItem({
      dishId: this.dish.id,
      name: this.dish.nombre,
      price: this.dish.precio,
      quantity: this.cantidad,
      restaurantId: this.restaurant.id,
      restaurantName: this.restaurant.nombre,
      image: this.dish.imagen,
      notes: this.instrucciones || undefined,
      spiceLevel: this.picante !== 'no' ? this.picante : undefined
    });

    // Show notification
    const text = `${this.cantidad}x ${this.dish.nombre} agregado${this.instrucciones ? ' con instrucciones' : ''}${this.picante !== 'no' ? ' • Picante: '+this.picante : ''}`;
    this.add.emit(text);
    this.close.emit();
  }
}
