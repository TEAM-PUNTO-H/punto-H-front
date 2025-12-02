import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, LoginResponse } from '../../services/auth.service';
import { MessageModalComponent, MessageType } from '../../shared/components/message-modal/message-modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule, MessageModalComponent],
  templateUrl: './login.html',
  styleUrl: './login.css'
})

export class Login implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  private auth = inject(AuthService);
  private loginSubscription?: Subscription;

  // Estado del modal
  modalOpen: boolean = false;
  modalMessage: string = '';
  modalType: MessageType = 'info';

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    // Suscribirse a los resultados del login
    this.loginSubscription = this.auth.loginResult$.subscribe((response: LoginResponse) => {
      this.showModal(response);
    });
  }

  ngOnDestroy() {
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    console.log('Datos enviados:', this.loginForm.value);
    this.auth.login(this.loginForm.value.email, this.loginForm.value.password);
  }

  showModal(response: LoginResponse) {
    this.modalMessage = response.message;
    this.modalType = response.type;
    this.modalOpen = true;

    // Si el login es exitoso y no es un vendedor no aprobado, navegar al perfil
    if (response.success && response.type === 'success') {
      // El usuario puede cerrar el modal y luego navegar, o navegar automáticamente después de un tiempo
      // Por ahora, dejamos que el usuario cierre el modal manualmente
    }
  }

  onModalClose() {
    this.modalOpen = false;
    
    // Si el login fue exitoso (no error), navegar al perfil
    if (this.modalType === 'success' || this.modalType === 'info') {
      // Si es un vendedor no aprobado, no navegamos al perfil todavía
      // Si es un cliente o vendedor aprobado, navegamos
      if (this.modalType === 'success') {
        this.router.navigate(['/profile']);
      }
    }
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get rememberMe() {
    return this.loginForm.get('rememberMe');
  }
}
