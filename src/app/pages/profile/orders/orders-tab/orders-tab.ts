import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderModalComponent, OrderDetail } from '../order-detail-modal/order-modal';

@Component({
  selector: 'app-orders-tab',
  standalone: true,
  imports: [CommonModule, OrderModalComponent],
  templateUrl: './orders-tab.html',
  styleUrls: ['./orders-tab.css']
})
export class OrdersTabComponent {
  // datos de ejemplo
  orders = [
    { id: '001', title: 'Pedido #001', items: ['2x Tacos al Pastor', '1x Bowl de Quinoa'], date: '15 Nov 2024, 2:30 PM', status: 'preparing', total: 110 },
    { id: '002', title: 'Pedido #002', items: ['Burger Clásica', 'Café Americano'], date: '14 Nov 2024, 1:15 PM', status: 'delivered', total: 100 },
    { id: '003', title: 'Pedido #003', items: ['Pizza Margherita', 'Refresco'], date: '13 Nov 2024, 12:00 PM', status: 'canceled', total: 85 }
  ];

  isModalOpen = false;
  selectedOrder: OrderDetail | null = null;

  // Datos detallados de ejemplo para el modal
  private orderDetails: { [key: string]: OrderDetail } = {
    '001': {
      id: '001',
      title: 'Pedido #001',
      restaurant: 'Tacos El Estudiante',
      date: '15 Nov 2024 • 2:30 PM',
      status: 'preparing',
      items: [
        { name: 'Tacos al Pastor', quantity: 2, price: 90 },
        { name: 'Bowl de Quinoa', quantity: 1, price: 65 }
      ],
      subtotal: 155,
      shipping: 10,
      taxes: 8,
      total: 173,
      deliveryAddress: 'Av. Universidad 123, Col. Centro, Ciudad Universitaria',
      paymentMethod: 'Tarjeta •••• 3452'
    },
    '002': {
      id: '002',
      title: 'Pedido #002',
      restaurant: 'Burger House',
      date: '14 Nov 2024 • 1:15 PM',
      status: 'delivered',
      items: [
        { name: 'Burger Clásica', quantity: 1, price: 85 },
        { name: 'Café Americano', quantity: 1, price: 25 }
      ],
      subtotal: 110,
      shipping: 10,
      taxes: 6,
      total: 126,
      deliveryAddress: 'Av. Universidad 123, Col. Centro, Ciudad Universitaria',
      paymentMethod: 'Tarjeta •••• 3452'
    },
    '003': {
      id: '003',
      title: 'Pedido #003',
      restaurant: 'Pizza Place',
      date: '13 Nov 2024 • 12:00 PM',
      status: 'canceled',
      items: [
        { name: 'Pizza Margherita', quantity: 1, price: 75 },
        { name: 'Refresco', quantity: 1, price: 20 }
      ],
      subtotal: 95,
      shipping: 10,
      taxes: 5,
      total: 110,
      deliveryAddress: 'Av. Universidad 123, Col. Centro, Ciudad Universitaria',
      paymentMethod: 'Tarjeta •••• 3452'
    }
  };

  viewDetail(orderId: string) {
    this.selectedOrder = this.orderDetails[orderId] || null;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedOrder = null;
  }

  cancelOrder(orderId: string) {
    if (confirm('¿Estás seguro de que deseas cancelar este pedido?')) {
      console.log('Cancelar pedido:', orderId);
      // Actualizar el estado del pedido
      const order = this.orders.find(o => o.id === orderId);
      if (order) {
        order.status = 'canceled';
      }
      if (this.selectedOrder && this.selectedOrder.id === orderId) {
        this.selectedOrder.status = 'canceled';
      }
      this.closeModal();
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

