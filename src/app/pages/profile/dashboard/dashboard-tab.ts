import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-tab.html',
  styleUrls: ['./dashboard-tab.css']
})
export class DashboardTabComponent {
  @Output() navigateToTab = new EventEmitter<string>();

  goToOrders() {
    this.navigateToTab.emit('historial-pedidos');
  }

  goToReviews() {
    this.navigateToTab.emit('resenas-favoritos');
  }

  goToOrder() {
    // No hace nada por ahora, ventana aún no diseñada
    console.log('Hacer Pedido - Funcionalidad pendiente');
  }

  goToCart() {
    // No hace nada por ahora, ventana aún no diseñada
    console.log('Mi Carrito - Funcionalidad pendiente');
  }
}

