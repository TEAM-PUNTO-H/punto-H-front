import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-security-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './security-tab.html',
  styleUrls: ['./security-tab.css']
})
export class SecurityTabComponent {
  pwdForm: FormGroup;
  private http = inject(HttpClient);
  private auth = inject(AuthService);

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
    const id= this.auth.userId();
    this.http.put(`http://104.237.5.100:3000/api/users/updateUser/${id}`, { password: this.pwdForm.value.newPassword }).subscribe({
      next: (response: any) => {
        console.log('Contraseña actualizada:', response);
        alert('Contraseña actualizada.');
      },
      error: (error: any) => {
        alert('Error al actualizar la contraseña.');
        console.error('Error al actualizar la contraseña:', error);
      }
    });
  }
}

