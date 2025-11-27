import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';

import { CatalogService, FavoriteRestaurant, UserReview } from '../../catalog/catalog.service';
import { OrderDetail } from '../orders/order-detail-modal/order-modal';

export type OrderStatus = 'preparing' | 'delivered' | 'canceled';

export interface OrderSummary {
  id: string;
  title: string;
  items: string[];
  date: string;
  status: OrderStatus;
  total: number;
  placedAt: Date;
}

export interface AccountStats {
  ordersCount: number;
  totalSpent: number;
  reviewsCount: number;
  favoritesCount: number;
}

export interface ActivityItem {
  icon: string;
  title: string;
  description: string;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileDataService {
  private orderDetails: Record<string, OrderDetail> = {
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

  private ordersSubject = new BehaviorSubject<OrderSummary[]>(this.sortOrders([
    {
      id: '001',
      title: 'Pedido #001',
      items: ['2x Tacos al Pastor', '1x Bowl de Quinoa'],
      date: '15 Nov 2024, 2:30 PM',
      status: 'preparing',
      total: 110,
      placedAt: new Date('2024-11-15T14:30:00')
    },
    {
      id: '002',
      title: 'Pedido #002',
      items: ['Burger Clásica', 'Café Americano'],
      date: '14 Nov 2024, 1:15 PM',
      status: 'delivered',
      total: 100,
      placedAt: new Date('2024-11-14T13:15:00')
    },
    {
      id: '003',
      title: 'Pedido #003',
      items: ['Pizza Margherita', 'Refresco'],
      date: '13 Nov 2024, 12:00 PM',
      status: 'canceled',
      total: 85,
      placedAt: new Date('2024-11-13T12:00:00')
    }
  ]));

  readonly orders$ = this.ordersSubject.asObservable();

  readonly recentOrders$ = this.orders$.pipe(
    map(orders => orders.slice(0, 2))
  );

  readonly accountStats$: Observable<AccountStats>;
  readonly activity$: Observable<ActivityItem[]>;

  constructor(private catalogService: CatalogService) {
    this.accountStats$ = combineLatest([
      this.orders$,
      this.catalogService.reviews$,
      this.catalogService.favorites$
    ]).pipe(
      map(([orders, reviews, favorites]) => this.buildAccountStats(orders, reviews, favorites))
    );

    this.activity$ = combineLatest([
      this.orders$,
      this.catalogService.reviews$,
      this.catalogService.favorites$
    ]).pipe(
      map(([orders, reviews, favorites]) => this.buildActivityFeed(orders, reviews, favorites))
    );
  }

  getOrderDetail(orderId: string): OrderDetail | null {
    return this.orderDetails[orderId] ?? null;
  }

  updateOrderStatus(orderId: string, status: OrderStatus): void {
    const updatedOrders = this.ordersSubject.value.map(order =>
      order.id === orderId ? { ...order, status } : order
    );

    this.ordersSubject.next(this.sortOrders(updatedOrders));

    if (this.orderDetails[orderId]) {
      this.orderDetails[orderId] = { ...this.orderDetails[orderId], status };
    }
  }

  private sortOrders(orders: OrderSummary[]): OrderSummary[] {
    return orders.slice().sort((a, b) => b.placedAt.getTime() - a.placedAt.getTime());
  }

  private buildAccountStats(
    orders: OrderSummary[],
    reviews: UserReview[],
    favorites: FavoriteRestaurant[]
  ): AccountStats {
    const totalSpent = orders
      .filter(order => order.status !== 'canceled')
      .reduce((sum, order) => sum + order.total, 0);

    return {
      ordersCount: orders.length,
      totalSpent,
      reviewsCount: reviews.length,
      favoritesCount: favorites.length
    };
  }

  private buildActivityFeed(
    orders: OrderSummary[],
    reviews: UserReview[],
    favorites: FavoriteRestaurant[]
  ): ActivityItem[] {
    const activities: ActivityItem[] = [];

    if (orders.length) {
      const latestOrder = orders[0];
      activities.push({
        icon: '📦',
        title: `${latestOrder.title}`,
        description: this.describeOrderStatus(latestOrder.status),
        timestamp: latestOrder.date
      });
    }

    if (reviews.length) {
      const recentReview = reviews[0];
      activities.push({
        icon: '⭐',
        title: 'Reseña publicada',
        description: `${recentReview.restaurantName}`,
        timestamp: recentReview.date
      });
    }

    if (favorites.length) {
      const recentFavorite = favorites[0];
      activities.push({
        icon: recentFavorite.emoji || '❤️',
        title: 'Restaurante agregado a favoritos',
        description: recentFavorite.name,
        timestamp: 'Hace unos minutos'
      });
    }

    return activities;
  }

  private describeOrderStatus(status: OrderStatus): string {
    switch (status) {
      case 'preparing':
        return 'Pedido en preparación';
      case 'delivered':
        return 'Pedido entregado';
      case 'canceled':
        return 'Pedido cancelado';
      default:
        return status;
    }
  }
}


