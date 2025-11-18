import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-personal-info-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './personal-info-tab.html',
  styleUrls: ['./personal-info-tab.css']
})
export class PersonalInfoTabComponent {
  profileForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      name: ['Juan Pérez García', [Validators.required]],
      email: [{value: 'juan.perez@universidad.edu', disabled: true}],
      phone: ['+52 555 123 4567', Validators.required],
      address: ['Av. Universidad 123, Col. Centro, Ciudad Universitaria'],
      notificationsEmail: [true],
      notificationsPush: [true],
      promotions: [false]
    });
  }

  save() {
    if (this.profileForm.invalid) return;
    // Aquí irá la llamada al servicio para guardar
    console.log('Guardando perfil', this.profileForm.value);
    alert('Información guardada (simulado).');
  }
}

