import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-profile-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-header.html',
  styleUrls: ['./profile-header.css']
})
export class ProfileHeaderComponent {
  constructor(private auth: AuthService) {}

  get fullName(): string {
    return this.auth.userFullName() || 'Usuario';
  }

  get email(): string {
    return this.auth.userEmail() || 'usuario@ejemplo.com';
  }

  get memberSince(): string {
    return this.auth.userMemberSince() || 'Nov 2024';
  }

  get initials(): string {
    const name = this.fullName;
    if (!name || name === 'Usuario') return 'U';
    
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}

