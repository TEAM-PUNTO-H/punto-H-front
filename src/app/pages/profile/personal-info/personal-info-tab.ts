import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-personal-info-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './personal-info-tab.html',
  styleUrls: ['./personal-info-tab.css']
})
export class PersonalInfoTabComponent implements OnInit {
  profileForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required]],
      email: [{value: '', disabled: true}],
      phone: ['', Validators.required],
      address: [''],
      notificationsEmail: [true],
      notificationsPush: [true],
      promotions: [false]
    });
  }

  ngOnInit() {
    // Cargar datos del usuario desde el AuthService
    const fullName = this.auth.userFullName() || '';
    const email = this.auth.userEmail() || '';
    const phone = this.auth.userPhone() || '';
    const address = this.auth.userAddress() || '';

    this.profileForm.patchValue({
      name: fullName,
      email: email,
      phone: phone,
      address: address
    });
  }

  save() {
    if (this.profileForm.invalid) return;
    // Aquí irá la llamada al servicio para guardar
    console.log('Guardando perfil', this.profileForm.value);
    alert('Información guardada (simulado).');
  }
}

