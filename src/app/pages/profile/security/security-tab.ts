import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-security-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './security-tab.html',
  styleUrls: ['./security-tab.css']
})
export class SecurityTabComponent {
  pwdForm: FormGroup;
  constructor(private fb: FormBuilder) {
    this.pwdForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmNewPassword: ['', Validators.required]
    });
  }

  changePassword() {
    if (this.pwdForm.invalid) return;
    if (this.pwdForm.value.newPassword !== this.pwdForm.value.confirmNewPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    console.log('Cambio de contraseña simulado', this.pwdForm.value);
    alert('Contraseña actualizada (simulado).');
  }
}

