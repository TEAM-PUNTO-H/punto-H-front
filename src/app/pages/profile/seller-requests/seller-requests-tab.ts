import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

export interface SellerRequest {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  state: 'pendiente' | 'activo' | 'denegado';
  role: string;
  createdAt?: string;
}

@Component({
  selector: 'app-seller-requests-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seller-requests-tab.html',
  styleUrls: ['./seller-requests-tab.css']
})
export class SellerRequestsTabComponent implements OnInit {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://104.237.5.100:3000/api/users';

  solicitudes: SellerRequest[] = [];
  loading: boolean = false;
  error: string | null = null;
  successMessage: string | null = null;

  ngOnInit() {
    this.cargarSolicitudesPendientes();
  }

  cargarSolicitudesPendientes() {
    this.loading = true;
    this.error = null;

    // Obtener todos los usuarios y filtrar los vendedores
    // withCredentials: true permite enviar cookies de autenticación
    this.http.get<any[]>(`${this.API_URL}/allUsers`, { withCredentials: true }).subscribe({
      next: (response: any) => {
        console.log('Todos los usuarios recibidos:', response);

        // Si la respuesta es un array, usarlo directamente
        // Si es un objeto con una propiedad, extraer el array
        const users = Array.isArray(response) ? response : (response.data || response.users || []);

        // Filtrar solo vendedores (pendientes, activos y denegados para permitir revertir)
        this.solicitudes = users
          .filter((user: any) => user.role === 'vendedor')
          .map((user: any) => ({
            id: user.id,
            fullName: user.fullName || user.nombre || 'Sin nombre',
            email: user.email || user.correo || '',
            phoneNumber: user.phoneNumber || user.telefono || '',
            state: (user.state || 'pendiente').toLowerCase() as 'pendiente' | 'activo' | 'denegado',
            role: user.role || 'vendedor',
            createdAt: user.createdAt || user.fechaSolicitud || new Date().toISOString()
          }));

        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar solicitudes:', error);
        this.error = 'Error al cargar las solicitudes. Por favor, intenta nuevamente.';
        this.loading = false;
      }
    });
  }

  get solicitudesPendientes(): SellerRequest[] {
    return this.solicitudes.filter(s => s.state === 'pendiente');
  }

  get solicitudesActivas(): SellerRequest[] {
    return this.solicitudes.filter(s => s.state === 'activo');
  }

  get solicitudesDenegadas(): SellerRequest[] {
    return this.solicitudes.filter(s => s.state === 'denegado');
  }

  actualizarEstadoUsuario(id: number, nuevoEstado: 'activo' | 'denegado', accion: string) {
    const solicitud = this.solicitudes.find(s => s.id === id);
    if (!solicitud) return;

    const mensajeConfirmacion = nuevoEstado === 'activo'
      ? `¿Estás seguro de que deseas aprobar esta solicitud?`
      : `¿Estás seguro de que deseas denegar esta solicitud?`;

    if (confirm(mensajeConfirmacion)) {
      this.loading = true;
      this.error = null;
      this.successMessage = null;

      // Obtener los datos actuales del usuario para enviarlos en la actualización
      const updateData = {
        state: nuevoEstado
      };

      // Actualizar el estado del usuario en el backend
      // withCredentials: true permite enviar cookies de autenticación
      this.http.put(`${this.API_URL}/updateUser/${id}`, updateData).subscribe({
        next: (response: any) => {
          console.log(`Usuario ${accion}:`, response);

          // Actualizar el estado localmente
          solicitud.state = nuevoEstado;

          const mensaje = nuevoEstado === 'activo'
            ? `Solicitud de ${solicitud.fullName} aprobada exitosamente.`
            : `Solicitud de ${solicitud.fullName} denegada.`;

          this.successMessage = mensaje;
          this.loading = false;

          // Recargar la lista después de un breve delay
          setTimeout(() => {
            this.cargarSolicitudesPendientes();
            this.successMessage = null;
          }, 2000);
        },
        error: (error: any) => {
          console.error(`Error al ${accion} solicitud:`, error);
          this.error = error.error?.message || `Error al ${accion} la solicitud. Por favor, intenta nuevamente.`;
          this.loading = false;
        }
      });
    }
  }

  aprobarSolicitud(id: number) {
    this.actualizarEstadoUsuario(id, 'activo', 'aprobar');
  }

  denegarSolicitud(id: number) {
    this.actualizarEstadoUsuario(id, 'denegado', 'denegar');
  }

  formatearFecha(fecha: string | undefined): string {
    if (!fecha) return 'Fecha no disponible';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
