import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})

export class Register implements OnInit {
  registerForm!: FormGroup;
  private auth = inject(AuthService);
  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^(\+?\d{1,3})?\s?\d{7,14}$/)]],
      tipoUsuario: ['', [Validators.required]],
      direccion: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      aceptaTerminos: [false, [Validators.requiredTrue]],
      aceptaPrivacidad: [false, [Validators.requiredTrue]],
      recibePromos: [false]
    }, { validators: [this.passwordsMatchValidator()] });

    this.configureDireccionValidation();
  }

  private passwordsMatchValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      if (!(control instanceof FormGroup)) {
        return null;
      }

      const password = control.get('password')?.value;
      const confirm = control.get('confirmPassword')?.value;
      return password === confirm ? null : { mismatch: true };
    };
  }
  private configureDireccionValidation() {
    const tipoUsuarioControl = this.registerForm.get('tipoUsuario');
    const direccionControl = this.registerForm.get('direccion');

    const toggleValidator = (tipo: string) => {
      if (!direccionControl) { return; }

      if (tipo === 'cliente') {
        direccionControl.setValidators([Validators.required]);
      } else {
        direccionControl.clearValidators();
      }

      direccionControl.updateValueAndValidity({ emitEvent: false });
    };

    toggleValidator(tipoUsuarioControl?.value);

    tipoUsuarioControl?.valueChanges.subscribe((value: string) => {
      toggleValidator(value);
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    console.log('Datos registrados:', this.registerForm.value);
    this.auth.register(
      this.registerForm.value.nombre,
      this.registerForm.value.email,
      this.registerForm.value.password,
      this.registerForm.value.tipoUsuario,
      this.registerForm.value.telefono
    );
   // this.router.navigate(['/login']); // vuelve al login después del registro
  }

  get nombre() { return this.registerForm.get('nombre'); }
  get email() { return this.registerForm.get('email'); }
  get telefono() { return this.registerForm.get('telefono'); }
  get tipoUsuario() { return this.registerForm.get('tipoUsuario'); }
  get direccion() { return this.registerForm.get('direccion'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get aceptaTerminos() { return this.registerForm.get('aceptaTerminos'); }
  get aceptaPrivacidad() { return this.registerForm.get('aceptaPrivacidad'); }
  get recibePromos() { return this.registerForm.get('recibePromos'); }
}
