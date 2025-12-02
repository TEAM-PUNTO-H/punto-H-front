import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, RegisterResponse } from '../../services/auth.service';
import { MessageModalComponent, MessageType } from '../../shared/components/message-modal/message-modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule, MessageModalComponent],
  templateUrl: './register.html',
  styleUrl: './register.css'
})

export class Register implements OnInit, OnDestroy {
  registerForm!: FormGroup;
  private auth = inject(AuthService);
  private registerSubscription?: Subscription;

  // Estado del modal
  modalOpen: boolean = false;
  modalMessage: string = '';
  modalType: MessageType = 'info';

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^(\+?\d{1,3})?\s?\d{7,14}$/)]],
      tipoUsuario: ['', [Validators.required]],
      direccion: [''], // Para clientes
      // Campos específicos para vendedores
      redesSociales: [''],
      horariosRestaurante: [''],
      direccionRestaurante: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      aceptaTerminos: [false, [Validators.requiredTrue]],
      aceptaPrivacidad: [false, [Validators.requiredTrue]],
      recibePromos: [false]
    }, { validators: [this.passwordsMatchValidator()] });

    this.configureDireccionValidation();
    this.configureVendedorFieldsValidation();

    // Suscribirse a los resultados del registro
    this.registerSubscription = this.auth.registerResult$.subscribe((response: RegisterResponse) => {
      this.showModal(response);
    });
  }

  ngOnDestroy() {
    if (this.registerSubscription) {
      this.registerSubscription.unsubscribe();
    }
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

      if (tipo === 'comprador') {
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

  private configureVendedorFieldsValidation() {
    const tipoUsuarioControl = this.registerForm.get('tipoUsuario');
    const redesSocialesControl = this.registerForm.get('redesSociales');
    const horariosRestauranteControl = this.registerForm.get('horariosRestaurante');
    const direccionRestauranteControl = this.registerForm.get('direccionRestaurante');

    const toggleVendedorValidators = (tipo: string) => {
      if (tipo === 'vendedor') {
        // Hacer los campos requeridos para vendedores
        redesSocialesControl?.setValidators([Validators.required]);
        horariosRestauranteControl?.setValidators([Validators.required]);
        direccionRestauranteControl?.setValidators([Validators.required]);
      } else {
        // Limpiar validadores si no es vendedor
        redesSocialesControl?.clearValidators();
        horariosRestauranteControl?.clearValidators();
        direccionRestauranteControl?.clearValidators();
      }

      // Actualizar validez sin disparar eventos
      redesSocialesControl?.updateValueAndValidity({ emitEvent: false });
      horariosRestauranteControl?.updateValueAndValidity({ emitEvent: false });
      direccionRestauranteControl?.updateValueAndValidity({ emitEvent: false });
    };

    // Aplicar validación inicial
    toggleVendedorValidators(tipoUsuarioControl?.value || '');

    // Suscribirse a cambios en el tipo de usuario
    tipoUsuarioControl?.valueChanges.subscribe((value: string) => {
      toggleVendedorValidators(value);
      
      // Limpiar valores si cambia el tipo de usuario
      if (value !== 'vendedor') {
        redesSocialesControl?.setValue('');
        horariosRestauranteControl?.setValue('');
        direccionRestauranteControl?.setValue('');
      }
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const formData = this.registerForm.value;
    const isVendedor = formData.tipoUsuario === 'vendedor';

    // Construir objeto de datos según el tipo de usuario
    const registrationData: any = {
      fullName: formData.nombre,
      email: formData.email,
      password: formData.password,
      role: formData.tipoUsuario,
      phoneNumber: formData.telefono
    };

    // Agregar campos específicos según el tipo de usuario
    if (isVendedor) {
      registrationData.redesSociales = formData.redesSociales;
      registrationData.horariosRestaurante = formData.horariosRestaurante;
      registrationData.direccionRestaurante = formData.direccionRestaurante;
    } else if (formData.tipoUsuario === 'comprador') {
      registrationData.direccion = formData.direccion;
    }

    console.log('Datos registrados:', registrationData);
    this.auth.register(
      registrationData.fullName,
      registrationData.email,
      registrationData.password,
      registrationData.role,
      registrationData.phoneNumber,
      isVendedor ? {
        redesSociales: registrationData.redesSociales,
        horariosRestaurante: registrationData.horariosRestaurante,
        direccionRestaurante: registrationData.direccionRestaurante
      } : undefined,
      !isVendedor && formData.tipoUsuario === 'comprador' ? registrationData.direccion : undefined
    );
  }

  showModal(response: RegisterResponse) {
    this.modalMessage = response.message;
    this.modalType = response.type;
    this.modalOpen = true;
  }

  onModalClose() {
    this.modalOpen = false;
    
    // Si el registro fue exitoso, navegar al login
    if (this.modalType === 'success') {
      this.router.navigate(['/login']);
    }
  }

  get nombre() { return this.registerForm.get('nombre'); }
  get email() { return this.registerForm.get('email'); }
  get telefono() { return this.registerForm.get('telefono'); }
  get tipoUsuario() { return this.registerForm.get('tipoUsuario'); }
  get direccion() { return this.registerForm.get('direccion'); }
  get redesSociales() { return this.registerForm.get('redesSociales'); }
  get horariosRestaurante() { return this.registerForm.get('horariosRestaurante'); }
  get direccionRestaurante() { return this.registerForm.get('direccionRestaurante'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get aceptaTerminos() { return this.registerForm.get('aceptaTerminos'); }
  get aceptaPrivacidad() { return this.registerForm.get('aceptaPrivacidad'); }
  get recibePromos() { return this.registerForm.get('recibePromos'); }
}
