import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

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
      const formData = {
        ...this.restaurantForm.value,
        tiempoEntrega: `${this.restaurantForm.value.tiempoMin}-${this.restaurantForm.value.tiempoMax}`
      };
      this.restaurantCreated.emit(formData);
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
}

