export interface Dish {
  id: string;
  nombre: string;
  precio: number;
  descripcion?: string;
  ingredientes?: string[];
  alergenos?: string[];
  disponible?: boolean;
  imagen?: string;
}

export interface Restaurant {
  id: string;
  ownerId?: string | number;
  nombre: string;
  emoji?: string;
  tipo: string[]; // e.g. ['mexicana','rapida']
  calificacion: number;
  resenas: number;
  tiempoMin: number;
  tiempoMax: number;
  costoEnvio: number;
  precioPromedio: number;
  rangoPrecios: string;
  abierto: boolean;
  delivery: boolean;
  nuevo: boolean;
  promocion: boolean;
  descripcion?: string;
  direccion?: string;
  telefono?: string;
  horario?: string;
  galeria?: string[];
  menu: { [categoria: string]: Dish[] };
  resenasList?: { usuario: string; calificacion: number; comentario: string; fecha: string }[];
}