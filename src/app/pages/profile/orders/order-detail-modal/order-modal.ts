import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface OrderDetail {
  id: string;
  title: string;
  restaurant: string;
  date: string;
  status: 'preparing' | 'delivered' | 'canceled';
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  shipping: number;
  taxes: number;
  total: number;
  deliveryAddress: string;
  paymentMethod: string;
}

@Component({
  selector: 'app-order-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-modal.html',
  styleUrls: ['./order-modal.css']
})
export class OrderModalComponent {
  @Input() order: OrderDetail | null = null;
  @Input() isOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() cancelOrder = new EventEmitter<string>();
  @Output() reorder = new EventEmitter<string>();
  @Output() viewInvoice = new EventEmitter<string>();

  close(): void {
    this.closeModal.emit();
  }

  onCancelOrder(): void {
    if (this.order && confirm('¿Estás seguro de que deseas cancelar este pedido?')) {
      this.cancelOrder.emit(this.order.id);
    }
  }

  onReorder(): void {
    if (this.order) {
      this.reorder.emit(this.order.id);
    }
  }

  onViewInvoice(): void {
    if (this.order) {
      this.viewInvoice.emit(this.order.id);
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'preparing':
        return 'En preparación';
      case 'delivered':
        return 'Entregado';
      case 'canceled':
        return 'Cancelado';
      default:
        return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'preparing':
        return 'yellow';
      case 'delivered':
        return 'green';
      case 'canceled':
        return 'red';
      default:
        return '';
    }
  }
}

