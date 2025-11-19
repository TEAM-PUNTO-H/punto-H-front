import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import type { Restaurant } from './restaurant.model';

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

  getRestaurants(): Restaurant[] {
    // return copy
    return JSON.parse(JSON.stringify(this.data));
  }

  getRestaurantById(id: string): Restaurant | undefined {
    return this.data.find(r => r.id === id);
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
  }

  updateUserReview(reviewId: string, changes: Partial<Pick<UserReview, 'title' | 'text' | 'rating'>>): void {
    const updated = this.reviewsSubject.value.map(r => {
      if (r.id !== reviewId) return r;
      return {
        ...r,
        ...changes,
        date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
      };
    });
    this.reviewsSubject.next(updated);
  }

  deleteUserReview(reviewId: string): void {
    this.reviewsSubject.next(this.reviewsSubject.value.filter(r => r.id !== reviewId));
  }
}
