import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SellerRequest {
  id: string;
  nombre: string;
  correo: string;
  fechaSolicitud: string;
  estado: 'pendiente' | 'aprobado' | 'denegado';
}

@Component({
  selector: 'app-seller-requests-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seller-requests-tab.html',
  styleUrls: ['./seller-requests-tab.css']
})
export class SellerRequestsTabComponent {
  // Datos de ejemplo - en producción vendrían de un servicio
  solicitudes: SellerRequest[] = [
    {
      id: '1',
      nombre: 'Juan Pérez',
      correo: 'juan.perez@example.com',
      fechaSolicitud: '2024-01-15',
      estado: 'pendiente'
    },
    {
      id: '2',
      nombre: 'María García',
      correo: 'maria.garcia@example.com',
      fechaSolicitud: '2024-01-18',
      estado: 'pendiente'
    }
  ];

  get solicitudesPendientes(): SellerRequest[] {
    return this.solicitudes.filter(s => s.estado === 'pendiente');
  }

  aprobarSolicitud(id: string) {
    if (confirm('¿Estás seguro de que deseas aprobar esta solicitud?')) {
      const solicitud = this.solicitudes.find(s => s.id === id);
      if (solicitud) {
        solicitud.estado = 'aprobado';
        // Aquí iría la lógica para actualizar en el backend
        console.log('Solicitud aprobada:', id);
      }
    }
  }

  denegarSolicitud(id: string) {
    if (confirm('¿Estás seguro de que deseas denegar esta solicitud?')) {
      const solicitud = this.solicitudes.find(s => s.id === id);
      if (solicitud) {
        solicitud.estado = 'denegado';
        // Aquí iría la lógica para actualizar en el backend
        console.log('Solicitud denegada:', id);
      }
    }
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

