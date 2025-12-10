import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateRestaurantFormComponent } from '../create-restaurant-form/create-restaurant-form';
import { RestaurantDashboardComponent } from '../restaurant-dashboard/restaurant-dashboard';
import { DishesListComponent, Dish } from '../dishes-list/dishes-list';
import { DishFormComponent, Dish as DishFormData } from '../dish-form/dish-form';
import { CatalogService } from '../../../catalog/catalog.service';
import { AuthService } from '../../../../services/auth.service';
import { MessageModalComponent, MessageType } from '../../../../shared/components/message-modal/message-modal';

type DishFormType = DishFormData;

type SellerView = 'create-restaurant' | 'dashboard' | 'dishes' | 'add-dish' | 'edit-dish' | 'edit-restaurant' | 'orders';

@Component({
  selector: 'app-seller-tab',
  standalone: true,
  imports: [
    CommonModule,
    CreateRestaurantFormComponent,
    RestaurantDashboardComponent,
    DishesListComponent,
    DishFormComponent,
    MessageModalComponent
  ],
  templateUrl: './seller-tab.html',
  styleUrls: ['./seller-tab.css']
})
export class SellerTabComponent implements OnInit {
  currentView: SellerView = 'create-restaurant';
  hasRestaurant: boolean = false;
  editingDishId: string | null = null;
  restaurantData: any = null;
  restaurantId: string | null = null;
  dishes: Dish[] = [];

  private readonly STORAGE_KEY = 'seller_restaurant_id';

  // Estado del modal
  modalOpen: boolean = false;
  modalMessage: string = '';
  modalType: MessageType = 'info';

  constructor(
    private catalogService: CatalogService,
    private authService: AuthService
  ) {
    this.loadRestaurantState();
    this.initializeView();
  }

  ngOnInit() {
    // Mostrar modal solo si es vendedor (no admin) y está pendiente o denegado
    if (!this.isAdmin() && this.isSellerPending) {
      this.showPendingModal();
    } else if (!this.isAdmin() && this.isSellerDenied) {
      this.showDeniedModal();
    }
  }

  /**
   * Verifica si el usuario actual es administrador
   */
  isAdmin(): boolean {
    const role = this.authService.userRole();
    return role === 'admin' || role === 'administrador' || role === 'moderador';
  }

  showPendingModal() {
    this.modalMessage = 'Tu solicitud para convertirte en vendedor está en proceso. Recibirás una notificación cuando sea aprobada.';
    this.modalType = 'info';
    this.modalOpen = true;
  }

  showDeniedModal() {
    this.modalMessage = 'Tu solicitud para convertirte en vendedor ha sido denegada. Si crees que esto es un error, por favor contacta con el administrador.';
    this.modalType = 'error';
    this.modalOpen = true;
  }

  onModalClose() {
    this.modalOpen = false;
  }

  get isSellerApproved(): boolean {
    const role = this.authService.userRole();
    const state = this.authService.sellerState();
    
    // Los admins siempre tienen acceso completo
    if (this.isAdmin()) {
      return true;
    }
    
    // Vendedor está aprobado si el estado es 'activo'
    return role === 'vendedor' && state === 'activo';
  }

  get isSellerPending(): boolean {
    // Los admins nunca están pendientes
    if (this.isAdmin()) {
      return false;
    }
    
    const role = this.authService.userRole();
    const state = this.authService.sellerState();
    // Vendedor está pendiente si el estado es 'pendiente'
    return role === 'vendedor' && state === 'pendiente';
  }

  get isSellerDenied(): boolean {
    // Los admins nunca están denegados
    if (this.isAdmin()) {
      return false;
    }
    
    const role = this.authService.userRole();
    const state = this.authService.sellerState();
    // Vendedor está denegado si el estado es 'denegado'
    return role === 'vendedor' && state === 'denegado';
  }

  private loadRestaurantState() {
    // Buscar restaurantes creados por vendedores en el catálogo
    // Solo persisten durante la sesión actual (no en localStorage)
    const allRestaurants = this.catalogService.getRestaurants();
    const sellerRestaurant = allRestaurants.find(r => r.id.startsWith('seller-'));
    if (sellerRestaurant) {
      this.restaurantId = sellerRestaurant.id;
      this.hasRestaurant = true;
      // Guardar solo el ID en localStorage para recordar qué restaurante mostrar
      // pero los datos del restaurante solo están en memoria durante la sesión
      localStorage.setItem(this.STORAGE_KEY, sellerRestaurant.id);
    }
  }

  private initializeView() {
    // Si ya tiene restaurante, mostrar dashboard; si no, mostrar formulario de creación
    if (this.hasRestaurant) {
      this.currentView = 'dashboard';
    } else {
      this.currentView = 'create-restaurant';
    }
  }

  onRestaurantCreated(restaurantData: any) {
    this.restaurantData = restaurantData;
    // Agregar restaurante al catálogo
    this.restaurantId = this.catalogService.addRestaurant(restaurantData);
    this.hasRestaurant = true;
    
    // Guardar el ID del restaurante en localStorage para persistencia
    if (this.restaurantId) {
      localStorage.setItem(this.STORAGE_KEY, this.restaurantId);
    }
    
    this.currentView = 'dashboard';
    console.log('Restaurante creado:', restaurantData, 'ID:', this.restaurantId);
  }

  navigateTo(view: string) {
    switch (view) {
      case 'dishes':
        this.currentView = 'dishes';
        break;
      case 'add-dish':
        this.currentView = 'add-dish';
        this.editingDishId = null;
        break;
      case 'edit-restaurant':
        this.currentView = 'edit-restaurant';
        break;
      case 'orders':
        this.currentView = 'orders';
        // Aquí se podría implementar la vista de pedidos
        alert('Vista de pedidos próximamente disponible');
        break;
      default:
        this.currentView = 'dashboard';
    }
  }

  onEditDish(dishId: string) {
    this.editingDishId = dishId;
    this.currentView = 'edit-dish';
  }

  onDeleteDish(dishId: string) {
    // La lógica de eliminación ya está en dishes-list
    // Aquí se podría actualizar desde el servicio
    console.log('Plato eliminado:', dishId);
  }

  onSaveDish(dishData: DishFormData) {
    if (!this.restaurantId) {
      console.error('No hay restaurante asociado');
      alert('Error: No se encontró el restaurante. Por favor, recarga la página.');
      return;
    }

    if (this.editingDishId) {
      // Actualizar plato existente - por simplicidad, eliminamos y agregamos de nuevo
      // En producción, esto sería una actualización real
      this.catalogService.removeDishFromRestaurant(this.restaurantId, this.editingDishId);
      this.catalogService.addDishToRestaurant(this.restaurantId, dishData);
      console.log('Plato actualizado:', dishData);
    } else {
      // Agregar nuevo plato al catálogo
      this.catalogService.addDishToRestaurant(this.restaurantId, dishData);
      console.log('Plato agregado:', dishData);
    }
    this.currentView = 'dishes';
    this.editingDishId = null;
  }

  onCancelDishForm() {
    this.currentView = 'dishes';
    this.editingDishId = null;
  }

  getDishToEdit(): DishFormType | null {
    if (!this.editingDishId || !this.restaurantId) return null;
    
    const restaurant = this.catalogService.getRestaurantById(this.restaurantId);
    if (!restaurant || !restaurant.menu) return null;

    // Buscar el plato en todas las categorías
    const allDishes = Object.values(restaurant.menu).flat();
    const dish = allDishes.find(d => d.id === this.editingDishId);
    
    if (!dish) return null;

    // Convertir al formato del formulario
    const picanteFromImage = (img: string | undefined): 'ninguno' | 'bajo' | 'medio' | 'alto' => {
      if (!img) return 'ninguno';
      if (img.includes('🟢')) return 'ninguno';
      if (img.includes('🟡')) return 'bajo';
      if (img.includes('🟠')) return 'medio';
      if (img.includes('🔴')) return 'alto';
      return 'ninguno';
    };

    // Convertir el tipo de imagen para que coincida con la interfaz Dish del formulario
    const dishImage: string | File | null = dish.imagen ? (dish.imagen as string) : null;
    
    return {
      id: dish.id,
      nombre: dish.nombre,
      descripcion: dish.descripcion || '',
      precio: dish.precio,
      imagen: dishImage,
      nivelPicante: picanteFromImage(dish.imagen)
    } as DishFormType;
  }
}