import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin } from 'rxjs';
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
  private readonly RESTAURANT_API = 'http://104.237.5.100:3000/api/restaurant';
  private readonly PRODUCTS_API = 'http://104.237.5.100:3000/api/products';

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

  private syncing = false;
  private hasFetchedFromBackend = false;

  constructor(private http: HttpClient) {
    // Inicializar con datos mock mientras se carga el backend
    this.restaurantsSubject.next([...this.data]);
    this.syncMockReviews();
    this.refreshFromBackend();
  }

  /**
   * Trae el restaurante del usuario específico (vendedor) y lo inserta en el catálogo.
   */
  loadRestaurantForOwner(ownerId: string | number) {
    return this.http.get<any>(`${this.RESTAURANT_API}/restaurantById/${ownerId}`, { withCredentials: true })
      .subscribe({
        next: (resp: any) => {
          const mapped = this.mapRestaurantsFromApi(Array.isArray(resp) ? resp : [resp]);
          if (mapped.length) {
            this.upsertRestaurants(mapped);
          }
        },
        error: (err: any) => {
          console.error('No se pudo cargar restaurante por usuario', err);
        }
      });
  }

  /**
   * Carga restaurantes y productos del backend y actualiza el catálogo.
   * Se puede forzar con force=true (por ejemplo, tras crear un restaurante/plato).
   */
  refreshFromBackend(force: boolean = false) {
    if (this.syncing && !force) return;
    this.syncing = true;

    forkJoin({
      restaurants: this.http.get<any[]>(`${this.RESTAURANT_API}/allRestaurants`, { withCredentials: true }),
      products: this.http.get<any[]>(`${this.PRODUCTS_API}/allProducts`, { withCredentials: true })
    }).subscribe({
      next: ({ restaurants, products }: { restaurants: any[]; products: any[] }) => {
        // Desempaquetar posibles envoltorios { message, products } / { message, restaurants }
        const restaurantsList = Array.isArray(restaurants)
          ? restaurants
          : Array.isArray((restaurants as any)?.restaurants)
            ? (restaurants as any).restaurants
            : [];

        const productsList = Array.isArray(products)
          ? products
          : Array.isArray((products as any)?.products)
            ? (products as any).products
            : [];

        const mappedRestaurants = this.mapRestaurantsFromApi(restaurantsList);
        const dishesByKey = this.mapProductsToDishes(productsList);
        const rawProducts = productsList;

        // Debug rápido para validar datos del backend
        console.log('[catalog] refreshFromBackend', {
          restaurantsCount: restaurantsList.length,
          productsCount: productsList.length,
          firstRestaurant: restaurantsList[0],
          firstProduct: productsList[0]
        });

        // Unir lo que ya está en memoria con lo que viene del backend
        const current = this.restaurantsSubject.value;
        const unionMap = new Map<string, Restaurant>();
        current.forEach((r: Restaurant) => unionMap.set(r.id, r));
        mappedRestaurants.forEach((r: Restaurant) => unionMap.set(r.id, r));

        let baseList = Array.from(unionMap.values());
        if (baseList.length === 0) {
          baseList = [...this.data];
        }

        // Guardar menús actuales para no perderlos si el backend no devuelve platos
        const currentMenuById = new Map<string, { [categoria: string]: Dish[] }>();
        current.forEach((r: Restaurant) => {
          currentMenuById.set(r.id, r.menu || {});
        });

        const merged = baseList.map((rest: Restaurant) => {
          const dishesForRestaurant = [
            ...(dishesByKey.byRestaurantId[rest.id] || []),
            ...(rest.ownerId ? (dishesByKey.byOwnerId[String(rest.ownerId)] || []) : [])
          ];

          // Fallback explícito por id_user si no llegó id_restaurant
          const ownerFallback = rest.ownerId
            ? rawProducts
                .filter((p: any) => String(p.id_user ?? p.userId ?? p.idUser ?? p.ownerId) === String(rest.ownerId))
                .map((prod: any, idx: number) => ({
                  id: String(prod.id ?? prod._id ?? prod.id_product ?? prod.productId ?? `dish-${idx}-${Date.now()}`),
                  nombre: prod.name ?? prod.nombre ?? 'Producto',
                  precio: Number(prod.price ?? prod.precio ?? 0),
                  descripcion: prod.description ?? prod.descripcion ?? '',
                  ingredientes: [],
                  alergenos: [],
                  disponible: prod.available ?? prod.disponible ?? true,
                  imagen: prod.image ?? '🍽️'
                }))
            : [];

          const existingMenu = currentMenuById.get(rest.id) || rest.menu || {};

          const menuCandidates = dishesForRestaurant.length > 0 ? dishesForRestaurant : ownerFallback;
          const menu = menuCandidates.length > 0 ? { Platos: menuCandidates } : existingMenu;

          // Si no hay platos del backend, recalcular con el menú existente
          const allDishes = menuCandidates.length > 0
            ? menuCandidates
            : (Object.values(existingMenu).flat() as Dish[]);

          const precioPromedio = allDishes.length
            ? allDishes.reduce((sum: number, d: Dish) => sum + (d.precio || 0), 0) / allDishes.length
            : rest.precioPromedio || 0;

          // Debug por restaurante para verificar asociación de platos
          console.log('[catalog] restaurant merge', {
            restId: rest.id,
            ownerId: rest.ownerId,
            dishesByRestaurant: dishesByKey.byRestaurantId[rest.id]?.length || 0,
            dishesByOwner: rest.ownerId ? (dishesByKey.byOwnerId[String(rest.ownerId)]?.length || 0) : 0,
            ownerFallbackCount: ownerFallback.length,
            finalMenuCount: menuCandidates.length,
            precioPromedio
          });

          return {
            ...rest,
            menu,
            precioPromedio,
            rangoPrecios: this.calculatePriceRange(precioPromedio)
          };
        });

        this.restaurantsSubject.next(merged);
        this.hasFetchedFromBackend = true;
      },
      error: (error: any) => {
        console.error('Error obteniendo datos del backend', error);
        if (!this.hasFetchedFromBackend) {
          this.restaurantsSubject.next([...this.data]);
        }
      },
      complete: () => {
        this.syncing = false;
      }
    });
  }

  /**
   * Devuelve el restaurante que pertenece al usuario indicado (id de vendedor).
   */
  getRestaurantByOwnerId(ownerId: string | number): Restaurant | undefined {
    return this.restaurantsSubject.value.find(
      (r: Restaurant) => String((r as any).ownerId ?? '') === String(ownerId)
    );
  }

  /**
   * Inserta o actualiza restaurantes en el subject principal.
   */
  private upsertRestaurants(newOnes: Restaurant[]) {
    const current = this.restaurantsSubject.value;
    const mergedMap = new Map<string, Restaurant>();

    [...current, ...newOnes].forEach((r: Restaurant) => {
      mergedMap.set(r.id, r);
    });

    this.restaurantsSubject.next(Array.from(mergedMap.values()));
  }

  private syncMockReviews() {
    // Sincronizar reseñas mock con el servicio de reseñas
    this.data.forEach(restaurant => {
      if (restaurant.resenasList && restaurant.resenasList.length > 0) {
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
          const exists = this.reviewsSubject.value.some((r: UserReview) => 
            r.restaurantId === restaurant.id && 
            r.usuario === resena.usuario && 
            r.text === resena.comentario
          );
          if (!exists) {
            this.reviewsSubject.next([...this.reviewsSubject.value, review]);
          }
        });
        this.updateRestaurantRating(restaurant.id);
      }
    });
  }

  private mapTypeFood(tipo: any): string[] {
    if (!tipo) return ['rapida'];
    const normalized = String(tipo).trim().toLowerCase();
    const map: { [k: string]: string[] } = {
      'mexicana': ['mexicana'],
      'sushi': ['japonesa'],
      'hamburguesas': ['rapida'],
      'cafetería': ['cafeteria'],
      'cafeteria': ['cafeteria'],
      'italiana': ['italiana'],
      'asiática': ['asiatica'],
      'asiatica': ['asiatica'],
      'vegetariana': ['vegetariana'],
      'pizza': ['italiana', 'rapida'],
      'mariscos': ['mariscos'],
      'comida rápida': ['rapida'],
      'rapida': ['rapida']
    };
    return map[normalized] || ['rapida'];
  }

  private mapRestaurantsFromApi(list: any[]): Restaurant[] {
    if (!Array.isArray(list)) return [];

    return list.map((raw, index) => {
      const restaurantId = raw.id ?? raw._id ?? raw.id_restaurant ?? raw.idRestaurant ?? `rest-${index}-${Date.now()}`;
      const ownerId = raw.id_user ?? raw.userId ?? raw.idUser ?? raw.ownerId ?? raw.user?.id;

      const base: Restaurant = {
        id: String(restaurantId),
        ownerId: ownerId !== undefined ? String(ownerId) : undefined,
        nombre: raw.name ?? raw.nombre ?? 'Restaurante',
        emoji: '🍽️',
        tipo: this.mapTypeFood(raw.typeFood ?? raw.tipoCocina),
        calificacion: Number(raw.calificacion ?? raw.rating ?? 0) || 0,
        resenas: raw.resenas?.length ?? raw.reviews?.length ?? 0,
        tiempoMin: Number(raw.minTime ?? raw.tiempoMin ?? 15),
        tiempoMax: Number(raw.maxTime ?? raw.tiempoMax ?? raw.minTime ?? 30),
        costoEnvio: Number(raw.sendCost ?? raw.costoEnvio ?? 0),
        precioPromedio: Number(raw.averagePrice ?? raw.precioPromedio ?? 0),
        rangoPrecios: this.calculatePriceRange(Number(raw.averagePrice ?? raw.precioPromedio ?? 0)),
        abierto: (raw.active ?? raw.abierto) ?? true,
        delivery: true,
        nuevo: false,
        promocion: false,
        descripcion: raw.description ?? raw.descripcion ?? '',
        direccion: raw.address ?? raw.direccion ?? '',
        telefono: raw.phoneNumber ?? raw.telefono ?? '',
        horario: raw.schedule ?? raw.horario ?? '',
        galeria: raw.image ? [raw.image] : ['🍽️'],
        menu: {},
        resenasList: Array.isArray(raw.reviews)
          ? raw.reviews.map((rev: any) => ({
              usuario: rev.usuario ?? rev.user ?? 'Usuario',
              calificacion: Number(rev.calificacion ?? rev.rating ?? 0),
              comentario: rev.comentario ?? rev.text ?? '',
              fecha: rev.fecha ?? rev.date ?? ''
            }))
          : []
      };

      return base;
    });
  }

  private mapProductsToDishes(products: any[]): {
    byRestaurantId: { [key: string]: Dish[] };
    byOwnerId: { [key: string]: Dish[] };
  } {
    const byRestaurantId: { [key: string]: Dish[] } = {};
    const byOwnerId: { [key: string]: Dish[] } = {};

    if (!Array.isArray(products)) return { byRestaurantId, byOwnerId };

    products.forEach((prod, index) => {
      const restaurantKey = prod.id_restaurant ?? prod.restaurantId ?? prod.idRestaurant ?? null;
      const ownerKey = prod.id_user ?? prod.userId ?? prod.idUser ?? prod.ownerId ?? null;

      const dish: Dish = {
        id: String(prod.id ?? prod._id ?? prod.id_product ?? prod.productId ?? `dish-${index}-${Date.now()}`),
        nombre: prod.name ?? prod.nombre ?? 'Producto',
        precio: Number(prod.price ?? prod.precio ?? 0),
        descripcion: prod.description ?? prod.descripcion ?? '',
        ingredientes: [],
        alergenos: [],
        disponible: prod.available ?? prod.disponible ?? true,
        imagen: prod.image ?? '🍽️'
      };

      if (restaurantKey !== null && restaurantKey !== undefined) {
        const key = String(restaurantKey);
        byRestaurantId[key] = [...(byRestaurantId[key] || []), dish];
      }

      if (ownerKey !== null && ownerKey !== undefined) {
        const key = String(ownerKey);
        byOwnerId[key] = [...(byOwnerId[key] || []), dish];
      }
    });

    return { byRestaurantId, byOwnerId };
  }

  getRestaurants(): Restaurant[] {
    // Obtener todos los restaurantes del subject (ya incluye los mock y los creados por vendedores)
    // Eliminar duplicados por ID para evitar restaurantes repetidos
    const allRestaurants: Restaurant[] = this.restaurantsSubject.value;
    const uniqueRestaurants = allRestaurants.filter((restaurant: Restaurant, index: number, self: Restaurant[]) =>
      index === self.findIndex((r: Restaurant) => r.id === restaurant.id)
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
      id: String(restaurantData.id || restaurantData.restaurantId || `seller-${Date.now()}`),
      ownerId: restaurantData.id_user || restaurantData.ownerId || restaurantData.userId,
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
    const updated = current.map((r: Restaurant) => {
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
    const restaurant = current.find((r: Restaurant) => r.id === restaurantId);
    
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
    Object.keys(restaurant.menu).forEach((categoria: string) => {
      menuCopy[categoria] = [...restaurant.menu[categoria]];
    });
    
    // Agregar a la categoría "Platos" o crear una nueva
    if (!menuCopy['Platos']) {
      menuCopy['Platos'] = [];
    }
    
    // Verificar si el plato ya existe (en caso de edición)
    const existingIndex = menuCopy['Platos'].findIndex((d: Dish) => d.id === nuevoPlato.id);
    if (existingIndex >= 0) {
      menuCopy['Platos'][existingIndex] = nuevoPlato;
    } else {
      menuCopy['Platos'] = [...menuCopy['Platos'], nuevoPlato];
    }

    // Actualizar precio promedio
    const allDishes = Object.values(menuCopy).flat() as Dish[];
    const precioPromedio = allDishes.length > 0
      ? allDishes.reduce((sum: number, d: Dish) => sum + d.precio, 0) / allDishes.length
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
    const restaurant = current.find((r: Restaurant) => r.id === restaurantId);
    
    if (!restaurant) return;

    // Buscar y eliminar el plato de todas las categorías
    Object.keys(restaurant.menu).forEach((categoria: string) => {
      restaurant.menu[categoria] = restaurant.menu[categoria].filter((d: Dish) => d.id !== dishId);
    });

    // Actualizar precio promedio
    const allDishes = Object.values(restaurant.menu).flat() as Dish[];
    const precioPromedio = allDishes.length > 0
      ? allDishes.reduce((sum: number, d: Dish) => sum + d.precio, 0) / allDishes.length
      : 0;

    this.updateRestaurant(restaurantId, {
      menu: restaurant.menu,
      precioPromedio: precioPromedio,
      rangoPrecios: this.calculatePriceRange(precioPromedio)
    });
  }

  getRestaurantById(id: string): Restaurant | undefined {
    const fromSubject = this.restaurantsSubject.value.find((r: Restaurant) => r.id === id);
    if (fromSubject) return fromSubject;
    return this.data.find(r => r.id === id);
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
    return this.favoritesSubject.value.some((f: FavoriteRestaurant) => f.id === id);
  }

  setFavorite(restaurant: Restaurant, shouldFavorite: boolean): void {
    const current = this.favoritesSubject.value;
    const exists = current.some((f: FavoriteRestaurant) => f.id === restaurant.id);

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
      this.favoritesSubject.next(current.filter((f: FavoriteRestaurant) => f.id !== restaurant.id));
    }
  }

  // Actualizar calificación en favoritos cuando cambie
  updateFavoriteRating(restaurantId: string, newRating: number): void {
    const current = this.favoritesSubject.value;
    const updated = current.map((f: FavoriteRestaurant) => {
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
    const restaurantReviews = this.reviewsSubject.value.filter((r: UserReview) => r.restaurantId === restaurantId);
    
    // Convertir UserReview a formato de resenasList
    const resenasList = restaurantReviews.map((review: UserReview) => ({
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
    const suma = restaurantReviews.reduce((sum: number, review: UserReview) => sum + review.rating, 0);
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
    const review = this.reviewsSubject.value.find((r: UserReview) => r.id === reviewId);
    if (!review) return;

    const updated = this.reviewsSubject.value.map((r: UserReview) => {
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
    const review = this.reviewsSubject.value.find((r: UserReview) => r.id === reviewId);
    if (!review) return;

    const restaurantId = review.restaurantId;
    this.reviewsSubject.next(this.reviewsSubject.value.filter((r: UserReview) => r.id !== reviewId));
    
    // Actualizar calificación del restaurante
    this.updateRestaurantRating(restaurantId);
  }

  // Método para obtener el desglose de calificaciones por estrellas
  getRatingBreakdown(restaurantId: string): { [rating: number]: number } {
    const reviews = this.reviewsSubject.value.filter((r: UserReview) => r.restaurantId === restaurantId);
    const breakdown: { [rating: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    reviews.forEach((review: UserReview) => {
      const rating = Math.round(review.rating);
      if (rating >= 1 && rating <= 5) {
        breakdown[rating] = (breakdown[rating] || 0) + 1;
      }
    });
    
    return breakdown;
  }
}