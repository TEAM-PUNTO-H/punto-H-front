import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-create-restaurant-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-restaurant-form.html',
  styleUrls: ['./create-restaurant-form.css']
})
export class CreateRestaurantFormComponent {
  @Output() restaurantCreated = new EventEmitter<any>();

  restaurantForm: FormGroup;
  imagePreview: string | null = null;
  loading: boolean = false;
  error: string | null = null;
  
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly API_URL = 'http://104.237.5.100:3000/api/restaurant';

  tiposCocina = [
    'Mexicana',
    'Sushi',
    'Hamburguesas',
    'Cafetería',
    'Italiana',
    'Asiática',
    'Vegetariana',
    'Pizza',
    'Mariscos',
    'Comida Rápida'
  ];

  constructor(private fb: FormBuilder) {
    this.restaurantForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      tipoCocina: ['', Validators.required],
      tiempoMin: ['', [Validators.required, Validators.min(10)]],
      tiempoMax: ['', [Validators.required, Validators.min(10)]],
      costoEnvio: ['', [Validators.required, Validators.min(0)]],
      direccion: ['', [Validators.required, Validators.minLength(10)]],
      phoneNumber: ['', [Validators.required, Validators.minLength(7)]],
      imagen: [null]
    });
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.restaurantForm.patchValue({ imagen: file });
      
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.restaurantForm.valid) {
      const userId = this.authService.userId();
      if (!userId) {
        this.error = 'Error: No se pudo obtener el ID del usuario. Por favor, inicia sesión nuevamente.';
        return;
      }

      this.loading = true;
      this.error = null;

      // Preparar los datos según el formato del endpoint
      // Asegurarse de que todos los campos tengan valores válidos
      const formValues = this.restaurantForm.value;
      
      // Debug: Ver todos los valores del formulario
      console.log('=== DEBUG: Valores del formulario ===');
      console.log('formValues completo:', formValues);
      console.log('formValues.direccion:', formValues.direccion);
      console.log('formValues.direccion tipo:', typeof formValues.direccion);
      console.log('formValues.direccion length:', formValues.direccion?.length);
      console.log('Estado del formulario:', this.restaurantForm.status);
      console.log('Errores del formulario:', this.restaurantForm.errors);
      console.log('Errores del campo direccion:', this.restaurantForm.get('direccion')?.errors);
      console.log('Valor del campo direccion:', this.restaurantForm.get('direccion')?.value);
      console.log('=====================================');
      
      // Obtener el valor directamente del control del formulario
      const direccionValue = this.restaurantForm.get('direccion')?.value || formValues.direccion || '';
      const nombreValue = this.restaurantForm.get('nombre')?.value || formValues.nombre || '';
      const descripcionValue = this.restaurantForm.get('descripcion')?.value || formValues.descripcion || '';
      const phoneNumberValue = this.restaurantForm.get('phoneNumber')?.value || formValues.phoneNumber || '';
      const tipoCocinaValue = this.restaurantForm.get('tipoCocina')?.value || formValues.tipoCocina || '';
      
      // Crear el objeto exactamente en el orden que espera el backend
      const restaurantData: {
        id_user: number;
        description: string;
        name: string;
        address: string;
        phoneNumber: string;
        sendCost: number;
        typeFood: string;
        minTime: number;
        maxTime: number;
      } = {
        id_user: userId,
        description: String(descripcionValue).trim(),
        name: String(nombreValue).trim(),
        address: String(direccionValue).trim(),
        phoneNumber: String(phoneNumberValue).trim(),
        sendCost: Number(formValues.costoEnvio) || 0,
        typeFood: String(tipoCocinaValue).trim(),
        minTime: Number(formValues.tiempoMin) || 0,
        maxTime: Number(formValues.tiempoMax) || 0
      };

      // Validar que los campos requeridos no estén vacíos
      if (!restaurantData.address || restaurantData.address.length === 0) {
        console.error('ERROR: address está vacío después del procesamiento');
        this.error = 'La dirección es requerida. Por favor, completa el campo de dirección.';
        this.loading = false;
        return;
      }
      
      if (!restaurantData.name || restaurantData.name.length === 0) {
        console.error('ERROR: name está vacío después del procesamiento');
        this.error = 'El nombre es requerido. Por favor, completa el campo de nombre.';
        this.loading = false;
        return;
      }

      console.log('=== Datos del restaurante a enviar ===');
      console.log('restaurantData completo:', restaurantData);
      console.log('restaurantData.address:', restaurantData.address);
      console.log('restaurantData.address length:', restaurantData.address.length);
      console.log('restaurantData.address tipo:', typeof restaurantData.address);
      console.log('JSON stringificado:', JSON.stringify(restaurantData));
      console.log('======================================');

      // Asegurarse de que el objeto se serialice correctamente
      const payload = JSON.parse(JSON.stringify(restaurantData));
      console.log('Payload después de JSON.parse/stringify:', payload);
      console.log('Payload.address:', payload.address);

      // Hacer la llamada al endpoint con headers explícitos
      this.http.post(`${this.API_URL}/create`, payload, { 
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true 
      }).subscribe({
        next: (response: any) => {
          console.log('Restaurante creado exitosamente:', response);
          this.loading = false;
          
          // Preparar los datos para el componente padre (mantener compatibilidad)
          const formData = {
            ...this.restaurantForm.value,
            tiempoEntrega: `${this.restaurantForm.value.tiempoMin}-${this.restaurantForm.value.tiempoMax}`,
            id: response.id || response.restaurant?.id,
            ...response
          };
          
          this.restaurantCreated.emit(formData);
        },
        error: (error: any) => {
          console.error('Error al crear restaurante:', error);
          console.error('Error completo:', error.error);
          this.loading = false;
          
          // Mostrar mensaje de error más específico
          let errorMessage = 'Error al crear el restaurante. Por favor, intenta nuevamente.';
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.error) {
            errorMessage = `Error: ${error.error.error}`;
          }
          
          this.error = errorMessage;
        }
      });
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.restaurantForm.controls).forEach(key => {
        this.restaurantForm.get(key)?.markAsTouched();
      });
    }
  }

  get nombre() { return this.restaurantForm.get('nombre'); }
  get descripcion() { return this.restaurantForm.get('descripcion'); }
  get tipoCocina() { return this.restaurantForm.get('tipoCocina'); }
  get tiempoMin() { return this.restaurantForm.get('tiempoMin'); }
  get tiempoMax() { return this.restaurantForm.get('tiempoMax'); }
  get costoEnvio() { return this.restaurantForm.get('costoEnvio'); }
  get direccion() { return this.restaurantForm.get('direccion'); }
  get phoneNumber() { return this.restaurantForm.get('phoneNumber'); }
}