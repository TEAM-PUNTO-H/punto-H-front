import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

import { OrderModalComponent, OrderDetail } from '../order-detail-modal/order-modal';
import { ProfileDataService, OrderSummary } from '../../services/profile-data.service';

@Component({
  selector: 'app-orders-tab',
  standalone: true,
  imports: [CommonModule, OrderModalComponent],
  templateUrl: './orders-tab.html',
  styleUrls: ['./orders-tab.css']
})
export class OrdersTabComponent {
  orders$: Observable<OrderSummary[]>;

  isModalOpen = false;
  selectedOrder: OrderDetail | null = null;

  constructor(private profileDataService: ProfileDataService) {
    this.orders$ = this.profileDataService.orders$;
  }

  viewDetail(orderId: string) {
    this.selectedOrder = this.profileDataService.getOrderDetail(orderId);
    this.isModalOpen = !!this.selectedOrder;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedOrder = null;
  }

  cancelOrder(orderId: string) {
    if (confirm('¿Estás seguro de que deseas cancelar este pedido?')) {
      this.profileDataService.updateOrderStatus(orderId, 'canceled');
      if (this.selectedOrder && this.selectedOrder.id === orderId) {
        this.selectedOrder = { ...this.selectedOrder, status: 'canceled' };
      }
      this.isModalOpen = false;
    }
  }

  reorder(orderId: string) {
    console.log('Reordenar pedido:', orderId);
    // Aquí irá la lógica para reordenar
    alert('Funcionalidad de reordenar próximamente disponible');
  }

  viewInvoice(orderId: string) {
    console.log('Ver factura del pedido:', orderId);
    // Aquí irá la lógica para ver la factura
    alert('Funcionalidad de ver factura próximamente disponible');
  }

  writeReview(orderId: string) {
    console.log('Escribir reseña para el pedido:', orderId);
    // Aquí irá la lógica para escribir reseña
  }
}

