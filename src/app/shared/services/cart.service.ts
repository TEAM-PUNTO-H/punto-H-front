import { Injectable, signal, computed } from '@angular/core';

export interface CartItem {
  id: string;
  dishId: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
  image?: string;
  notes?: string;
  spiceLevel?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Signals for cart state
  // El carrito solo persiste durante la sesión actual (no en localStorage)
  private cartItemsSignal = signal<CartItem[]>([]);
  public modalOpen = signal<boolean>(false);

  // Computed signals
  public items = computed(() => this.cartItemsSignal());
  public itemCount = computed(() => 
    this.cartItemsSignal().reduce((sum, item) => sum + item.quantity, 0)
  );
  public subtotal = computed(() =>
    this.cartItemsSignal().reduce((sum, item) => sum + (item.price * item.quantity), 0)
  );
  public shipping = computed(() => {
    const items = this.cartItemsSignal();
    if (items.length === 0) return 0;
    // Get unique restaurants
    const restaurants = new Set(items.map(item => item.restaurantId));
    // Calculate shipping: 10 per restaurant, free if subtotal > 200
    const baseShipping = restaurants.size * 10;
    const subtotalValue = this.subtotal();
    return subtotalValue > 200 ? 0 : baseShipping;
  });
  public total = computed(() => this.subtotal() + this.shipping());
  public estimatedDeliveryTime = computed(() => {
    const items = this.cartItemsSignal();
    if (items.length === 0) return '0 min';
    // Simple calculation: 30-45 min average
    return '30-45 min';
  });

  constructor() {
    // El carrito inicia vacío y solo persiste durante la sesión
    // Cuando se conecte con backend, se cargará desde la base de datos
  }

  addItem(item: Omit<CartItem, 'id'>): void {
    const newItem: CartItem = {
      ...item,
      id: `${item.dishId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    const currentItems = this.cartItemsSignal();
    const existingIndex = currentItems.findIndex(
      i => i.dishId === item.dishId && 
           i.restaurantId === item.restaurantId &&
           i.notes === item.notes &&
           i.spiceLevel === item.spiceLevel
    );

    if (existingIndex >= 0) {
      // Update quantity if same item
      const updated = [...currentItems];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + item.quantity
      };
      this.cartItemsSignal.set(updated);
    } else {
      // Add new item
      this.cartItemsSignal.set([...currentItems, newItem]);
    }
    // No guardar en localStorage - solo persiste durante la sesión
  }

  removeItem(id: string): void {
    const currentItems = this.cartItemsSignal();
    const updated = currentItems.filter(item => item.id !== id);
    this.cartItemsSignal.set(updated);
    // No guardar en localStorage - solo persiste durante la sesión
  }

  increaseQty(id: string): void {
    const currentItems = this.cartItemsSignal();
    const updated = currentItems.map(item =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    this.cartItemsSignal.set(updated);
    // No guardar en localStorage - solo persiste durante la sesión
  }

  decreaseQty(id: string): void {
    const currentItems = this.cartItemsSignal();
    const updated = currentItems.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity - 1);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    this.cartItemsSignal.set(updated);
    // No guardar en localStorage - solo persiste durante la sesión
  }

  clearCart(): void {
    this.cartItemsSignal.set([]);
    // No guardar en localStorage - solo persiste durante la sesión
  }

  getTotal(): number {
    return this.total();
  }

  getCount(): number {
    return this.itemCount();
  }

  openModal(): void {
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }
}

