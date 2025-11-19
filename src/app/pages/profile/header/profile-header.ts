import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-header.html',
  styleUrls: ['./profile-header.css']
})
export class ProfileHeaderComponent {
  // datos de ejemplo (luego vendrán del servicio)
  fullName = 'Juan Pérez García';
  email = 'juan.perez@universidad.edu';
  memberSince = 'Nov 2024';
  initials = 'JP';
}

