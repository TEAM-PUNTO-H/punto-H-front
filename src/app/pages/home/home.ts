import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomePage {
  // Exponer el servicio directamente para usar el signal en el template
  auth = inject(AuthService);

  // Getter para isLoggedIn que retorna el signal directamente
  // Angular detectará automáticamente los cambios del signal en el template
  get isLoggedIn() {
    return this.auth.isLoggedIn;
  }
}