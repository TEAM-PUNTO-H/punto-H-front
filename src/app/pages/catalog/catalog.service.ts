import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import type { Restaurant, Dish } from './restaurant.model';

export interface FavoriteRestaurant {
  id: string;
  name: string;
  rating: number;
  emoji: string;
}

export interface UserReview {
  id: string;
  restaurantId: string;
  restaurantName: string;
  title: string;
  rating: number;
  text: string;
  date: string;
  usuario: string;
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private restaurantsSubject = new BehaviorSubject<Restaurant[]>([]);
  restaurants$ = this.restaurantsSubject.asObservable();

  // MOCK: solo tres restaurantes como ejemplo
  private data: Restaurant[] = [
    // Tacos
    {
      id: 'tacos',
      nombre: 'Tacos El Estudiante',
      emoji: '🌮',
      tipo: ['mexicana','rapida'],
      calificacion: 4.8,
      resenas: 124,
      tiempoMin: 15,
      tiempoMax: 25,
      costoEnvio: 0,
      precioPromedio: 45,
      rangoPrecios: 'bajo',
      abierto: true,
      delivery: true,
      nuevo: false,
      promocion: true,
      descripcion: 'Los mejores tacos al pastor de la universidad. Receta tradicional con ingredientes frescos.',
      direccion: 'Av. Universidad 123, Campus Central',
      telefono: '555-0123',
      horario: 'Lun-Vie: 8:00 AM - 10:00 PM, Sáb-Dom: 9:00 AM - 11:00 PM',
      galeria: ['🌮','🌯','🥙'],
      menu: {
        'Tacos': [
          { id: 't1', nombre: 'Tacos al Pastor', precio: 45, descripcion: '3 tacos con piña, cebolla y cilantro', ingredientes: ['Carne de cerdo','Piña'], alergenos: ['Gluten'], disponible: true, imagen: '🌮' },
          { id: 't2', nombre: 'Tacos Vegetarianos', precio: 40, descripcion: '3 tacos con nopales y queso', ingredientes: ['Nopales','Queso'], alergenos: ['Lácteos'], disponible: true, imagen: '🌮' }
        ]
      },
      resenasList: [
        { usuario: 'María G.', calificacion: 5, comentario: 'Excelentes tacos', fecha: '2024-11-10' }
      ]
    },
    // Bowls
    {
      id: 'bowls',
      nombre: 'Bowls Saludables',
      emoji: '🥗',
      tipo: ['vegetariana','vegana'],
      calificacion: 4.9,
      resenas: 89,
      tiempoMin: 10,
      tiempoMax: 20,
      costoEnvio: 15,
      precioPromedio: 65,
      rangoPrecios: 'medio',
      abierto: true,
      delivery: true,
      nuevo: false,
      promocion: false,
      descripcion: 'Comida saludable y balanceada. Bowls personalizables con ingredientes orgánicos.',
      direccion: 'Calle Salud 456, Edificio B',
      telefono: '555-0456',
      horario: 'Lun-Sáb: 9:00 AM - 8:00 PM',
      galeria: ['🥗','🥙'],
      menu: {
        'Bowls': [
          { id: 'bw1', nombre: 'Bowl de Quinoa', precio: 65, descripcion: 'Quinoa, vegetales y aderezo', ingredientes: ['Quinoa','Aguacate'], alergenos: ['Lácteos'], disponible: true, imagen: '🥗' }
        ]
      },
      resenasList: [
        { usuario: 'Laura P.', calificacion: 5, comentario: 'Ingredientes fresquísimos', fecha: '2024-11-12' }
      ]
    },
    // Café
    {
      id: 'cafe',
      nombre: 'Café Campus',
      emoji: '☕',
      tipo: ['cafeteria'],
      calificacion: 4.7,
      resenas: 156,
      tiempoMin: 5,
      tiempoMax: 15,
      costoEnvio: 0,
      precioPromedio: 30,
      rangoPrecios: 'bajo',
      abierto: true,
      delivery: true,
      nuevo: false,
      promocion: true,
      descripcion: 'Café de especialidad y postres artesanales.',
      direccion: 'Plaza Universitaria, Local 12',
      telefono: '555-0789',
      horario: 'Lun-Dom: 7:00 AM - 11:00 PM',
      galeria: ['☕','🥐'],
      menu: {
        'Cafés': [
          { id: 'c1', nombre: 'Café Americano', precio: 25, descripcion: 'Café premium', ingredientes: ['Café arábica'], alergenos: [], disponible: true, imagen: '☕' }
        ]
      },
      resenasList: [
        { usuario: 'Sofia L.', calificacion: 5, comentario: 'Ambiente perfecto', fecha: '2024-11-11' }
      ]
    }
  ];

  private favoritesSubject = new BehaviorSubject<FavoriteRestaurant[]>([
    { id: 'tacos', name: 'Tacos El Estudiante', rating: 4.8, emoji: '🌮' },
    { id: 'bowls', name: 'Bowls Saludables', rating: 4.9, emoji: '🥗' }
  ]);
  favorites$ = this.favoritesSubject.asObservable();

  private reviewsSubject = new BehaviorSubject<UserReview[]>([
    {
      id: 'tacos-001',
      restaurantId: 'tacos',
      restaurantName: 'Tacos El Estudiante',
      title: 'Tacos El Estudiante',
      rating: 5,
      text: 'Excelente sabor...',
      date: '14 Nov 2024',
      usuario: 'María G.'
    },
    {
      id: 'bowls-001',
      restaurantId: 'bowls',
      restaurantName: 'Bowls Saludables',
      title: 'Bowls Saludables',
      rating: 5,
      text: 'Ingredientes frescos...',
      date: '12 Nov 2024',
      usuario: 'Laura P.'
    }
  ]);
  reviews$ = this.reviewsSubject.asObservable();

  constructor() {
    // Inicializar con los datos mock
    // Los restaurantes creados por vendedores solo persisten durante la sesión
    // Cuando se conecte con backend, se cargarán desde la base de datos
    this.restaurantsSubject.next([...this.data]);
    
    // Sincronizar reseñas mock con el servicio de reseñas
    this.data.forEach(restaurant => {
      if (restaurant.resenasList && restaurant.resenasList.length > 0) {
        // Agregar reseñas mock al servicio
        restaurant.resenasList.forEach(resena => {
          const review: UserReview = {
            id: `${restaurant.id}-${restaurant.resenasList!.indexOf(resena)}`,
            restaurantId: restaurant.id,
            restaurantName: restaurant.nombre,
            title: restaurant.nombre,
            rating: resena.calificacion,
            text: resena.comentario,
            date: resena.fecha,
            usuario: resena.usuario
          };
          // Solo agregar si no existe ya
          const exists = this.reviewsSubject.value.some(r => 
            r.restaurantId === restaurant.id && 
            r.usuario === resena.usuario && 
            r.text === resena.comentario
          );
          if (!exists) {
            this.reviewsSubject.next([...this.reviewsSubject.value, review]);
          }
        });
        
        // Calcular calificación inicial
        this.updateRestaurantRating(restaurant.id);
      }
    });
  }

  getRestaurants(): Restaurant[] {
    // Obtener todos los restaurantes del subject (ya incluye los mock y los creados por vendedores)
    // Eliminar duplicados por ID para evitar restaurantes repetidos
    const allRestaurants = this.restaurantsSubject.value;
    const uniqueRestaurants = allRestaurants.filter((restaurant, index, self) =>
      index === self.findIndex(r => r.id === restaurant.id)
    );
    return JSON.parse(JSON.stringify(uniqueRestaurants));
  }

  // Métodos para vendedores
  addRestaurant(restaurantData: any): string {
    const tiempoParts = restaurantData.tiempoEntrega?.split('-') || [restaurantData.tiempoMin || 30, restaurantData.tiempoMax || 60];
    const tiempoMin = parseInt(tiempoParts[0]) || 30;
    const tiempoMax = parseInt(tiempoParts[1]) || 60;
    const precioPromedio = 0; // Se calculará cuando haya platos

    // Mapear tipo de cocina a formato del catálogo
    const tipoCocinaMap: { [key: string]: string[] } = {
      'Mexicana': ['mexicana'],
      'Sushi': ['japonesa'],
      'Hamburguesas': ['rapida'],
      'Cafetería': ['cafeteria'],
      'Italiana': ['italiana'],
      'Asiática': ['asiatica'],
      'Vegetariana': ['vegetariana'],
      'Pizza': ['italiana', 'rapida'],
      'Mariscos': ['mariscos'],
      'Comida Rápida': ['rapida']
    };

    const nuevoRestaurante: Restaurant = {
      id: `seller-${Date.now()}`,
      nombre: restaurantData.nombre,
      emoji: '🍽️',
      tipo: tipoCocinaMap[restaurantData.tipoCocina] || ['rapida'],
      calificacion: 0,
      resenas: 0,
      tiempoMin: tiempoMin,
      tiempoMax: tiempoMax,
      costoEnvio: restaurantData.costoEnvio || 0,
      precioPromedio: precioPromedio,
      rangoPrecios: this.calculatePriceRange(precioPromedio),
      abierto: true,
      delivery: true,
      nuevo: true,
      promocion: false,
      descripcion: restaurantData.descripcion || '',
      direccion: restaurantData.direccion || '',
      telefono: '',
      horario: '',
      galeria: this.processRestaurantImage(restaurantData.imagen),
      menu: {},
      resenasList: []
    };

    const current = this.restaurantsSubject.value;
    const updated = [...current, nuevoRestaurante];
    this.restaurantsSubject.next(updated);
    // No guardar en localStorage - solo persiste durante la sesión
    return nuevoRestaurante.id;
  }

  updateRestaurant(restaurantId: string, updates: Partial<Restaurant>): void {
    const current = this.restaurantsSubject.value;
    const updated = current.map(r => {
      if (r.id === restaurantId) {
        // Crear una copia profunda del restaurante con las actualizaciones
        const updatedRestaurant = { ...r };
        
        // Si hay actualizaciones en el menú, hacer una copia profunda
        if (updates.menu) {
          const menuCopy: { [categoria: string]: Dish[] } = {};
          Object.keys(updates.menu).forEach(categoria => {
            menuCopy[categoria] = [...updates.menu![categoria]];
          });
          updatedRestaurant.menu = menuCopy;
        }
        
        // Aplicar otras actualizaciones
        Object.keys(updates).forEach(key => {
          if (key !== 'menu') {
            (updatedRestaurant as any)[key] = (updates as any)[key];
          }
        });
        
        return updatedRestaurant;
      }
      return r;
    });
    this.restaurantsSubject.next(updated);
    // No guardar en localStorage - solo persiste durante la sesión
  }

  addDishToRestaurant(restaurantId: string, dishData: any): void {
    const current = this.restaurantsSubject.value;
    const restaurant = current.find(r => r.id === restaurantId);
    
    if (!restaurant) {
      console.error('Restaurante no encontrado:', restaurantId);
      return;
    }

    // Convertir nivel de picante a formato del catálogo
    const picanteMap: { [key: string]: string } = {
      'ninguno': '🟢',
      'bajo': '🟡',
      'medio': '🟠',
      'alto': '🔴'
    };

    // Si dishData.imagen es un File, convertirlo a URL
    let imagenUrl = dishData.imagen;
    if (dishData.imagen instanceof File) {
      imagenUrl = URL.createObjectURL(dishData.imagen);
    } else if (!dishData.imagen) {
      imagenUrl = picanteMap[dishData.nivelPicante] || '🍽️';
    }

    const nuevoPlato: Dish = {
      id: dishData.id || `dish-${Date.now()}`,
      nombre: dishData.nombre,
      precio: dishData.precio,
      descripcion: dishData.descripcion || '',
      ingredientes: [],
      alergenos: [],
      disponible: true,
      imagen: imagenUrl
    };

    // Crear una copia profunda del menú para evitar mutaciones directas
    const menuCopy: { [categoria: string]: Dish[] } = {};
    Object.keys(restaurant.menu).forEach(categoria => {
      menuCopy[categoria] = [...restaurant.menu[categoria]];
    });
    
    // Agregar a la categoría "Platos" o crear una nueva
    if (!menuCopy['Platos']) {
      menuCopy['Platos'] = [];
    }
    
    // Verificar si el plato ya existe (en caso de edición)
    const existingIndex = menuCopy['Platos'].findIndex(d => d.id === nuevoPlato.id);
    if (existingIndex >= 0) {
      menuCopy['Platos'][existingIndex] = nuevoPlato;
    } else {
      menuCopy['Platos'] = [...menuCopy['Platos'], nuevoPlato];
    }

    // Actualizar precio promedio
    const allDishes = Object.values(menuCopy).flat();
    const precioPromedio = allDishes.length > 0
      ? allDishes.reduce((sum, d) => sum + d.precio, 0) / allDishes.length
      : 0;

    // Actualizar el restaurante con el nuevo menú
    this.updateRestaurant(restaurantId, {
      menu: menuCopy,
      precioPromedio: precioPromedio,
      rangoPrecios: this.calculatePriceRange(precioPromedio)
    });
    
    console.log('Plato agregado/actualizado en restaurante:', restaurantId, nuevoPlato);
  }

  removeDishFromRestaurant(restaurantId: string, dishId: string): void {
    const current = this.restaurantsSubject.value;
    const restaurant = current.find(r => r.id === restaurantId);
    
    if (!restaurant) return;

    // Buscar y eliminar el plato de todas las categorías
    Object.keys(restaurant.menu).forEach(categoria => {
      restaurant.menu[categoria] = restaurant.menu[categoria].filter(d => d.id !== dishId);
    });

    // Actualizar precio promedio
    const allDishes = Object.values(restaurant.menu).flat();
    const precioPromedio = allDishes.length > 0
      ? allDishes.reduce((sum, d) => sum + d.precio, 0) / allDishes.length
      : 0;

    this.updateRestaurant(restaurantId, {
      menu: restaurant.menu,
      precioPromedio: precioPromedio,
      rangoPrecios: this.calculatePriceRange(precioPromedio)
    });
  }

  getRestaurantById(id: string): Restaurant | undefined {
    const allRestaurants = [...this.data, ...this.restaurantsSubject.value];
    return allRestaurants.find(r => r.id === id);
  }

  private calculatePriceRange(precioPromedio: number): string {
    if (precioPromedio < 30) return 'bajo';
    if (precioPromedio < 60) return 'medio';
    return 'alto';
  }

  private processRestaurantImage(imagen: any): string[] {
    if (!imagen) return ['🍽️'];
    if (imagen instanceof File) {
      return [URL.createObjectURL(imagen)];
    }
    if (typeof imagen === 'string') {
      return [imagen];
    }
    return ['🍽️'];
  }


  isRestaurantFavorite(id: string): boolean {
    return this.favoritesSubject.value.some(f => f.id === id);
  }

  setFavorite(restaurant: Restaurant, shouldFavorite: boolean): void {
    const current = this.favoritesSubject.value;
    const exists = current.some(f => f.id === restaurant.id);

    if (shouldFavorite && !exists) {
      const updated: FavoriteRestaurant = {
        id: restaurant.id,
        name: restaurant.nombre,
        rating: restaurant.calificacion,
        emoji: restaurant.emoji ?? '🍽️'
      };
      this.favoritesSubject.next([updated, ...current]);
    }

    if (!shouldFavorite && exists) {
      this.favoritesSubject.next(current.filter(f => f.id !== restaurant.id));
    }
  }

  // Actualizar calificación en favoritos cuando cambie
  updateFavoriteRating(restaurantId: string, newRating: number): void {
    const current = this.favoritesSubject.value;
    const updated = current.map(f => {
      if (f.id === restaurantId) {
        return { ...f, rating: newRating };
      }
      return f;
    });
    this.favoritesSubject.next(updated);
  }

  addUserReview(restaurant: Restaurant, payload: { usuario: string; comentario: string; calificacion: number; fecha: string; }): void {
    const newReview: UserReview = {
      id: `${restaurant.id}-${Date.now()}`,
      restaurantId: restaurant.id,
      restaurantName: restaurant.nombre,
      title: restaurant.nombre,
      rating: payload.calificacion,
      text: payload.comentario,
      date: payload.fecha,
      usuario: payload.usuario
    };
    this.reviewsSubject.next([newReview, ...this.reviewsSubject.value]);
    
    // Actualizar calificación del restaurante
    this.updateRestaurantRating(restaurant.id);
  }

  private updateRestaurantRating(restaurantId: string): void {
    // Obtener todas las reseñas del restaurante desde el servicio
    const restaurantReviews = this.reviewsSubject.value.filter(r => r.restaurantId === restaurantId);
    
    // Convertir UserReview a formato de resenasList
    const resenasList = restaurantReviews.map(review => ({
      usuario: review.usuario,
      calificacion: review.rating,
      comentario: review.text,
      fecha: review.date
    }));
    
    if (restaurantReviews.length === 0) {
      // Si no hay reseñas, establecer calificación en 0
      this.updateRestaurant(restaurantId, { 
        calificacion: 0, 
        resenas: 0,
        resenasList: []
      });
      return;
    }

    // Calcular promedio
    const suma = restaurantReviews.reduce((sum, review) => sum + review.rating, 0);
    const promedio = suma / restaurantReviews.length;
    const promedioRedondeado = Math.round(promedio * 10) / 10; // Redondear a 1 decimal

    // Actualizar restaurante con calificación, número de reseñas y lista de reseñas
    this.updateRestaurant(restaurantId, {
      calificacion: promedioRedondeado,
      resenas: restaurantReviews.length,
      resenasList: resenasList
    });

    // Actualizar también la calificación en favoritos si el restaurante está en favoritos
    this.updateFavoriteRating(restaurantId, promedioRedondeado);
  }

  updateUserReview(reviewId: string, changes: Partial<Pick<UserReview, 'title' | 'text' | 'rating'>>): void {
    const review = this.reviewsSubject.value.find(r => r.id === reviewId);
    if (!review) return;

    const updated = this.reviewsSubject.value.map(r => {
      if (r.id !== reviewId) return r;
      return {
        ...r,
        ...changes,
        date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
      };
    });
    this.reviewsSubject.next(updated);
    
    // Actualizar calificación del restaurante
    this.updateRestaurantRating(review.restaurantId);
  }

  deleteUserReview(reviewId: string): void {
    const review = this.reviewsSubject.value.find(r => r.id === reviewId);
    if (!review) return;

    const restaurantId = review.restaurantId;
    this.reviewsSubject.next(this.reviewsSubject.value.filter(r => r.id !== reviewId));
    
    // Actualizar calificación del restaurante
    this.updateRestaurantRating(restaurantId);
  }

  // Método para obtener el desglose de calificaciones por estrellas
  getRatingBreakdown(restaurantId: string): { [rating: number]: number } {
    const reviews = this.reviewsSubject.value.filter(r => r.restaurantId === restaurantId);
    const breakdown: { [rating: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    reviews.forEach(review => {
      const rating = Math.round(review.rating);
      if (rating >= 1 && rating <= 5) {
        breakdown[rating] = (breakdown[rating] || 0) + 1;
      }
    });
    
    return breakdown;
  }
}
