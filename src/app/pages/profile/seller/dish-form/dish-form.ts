import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

export interface Dish {
  id?: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string | File | null;
  nivelPicante: 'ninguno' | 'bajo' | 'medio' | 'alto';
}

@Component({
  selector: 'app-dish-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dish-form.html',
  styleUrls: ['./dish-form.css']
})
export class DishFormComponent implements OnInit {
  @Input() dish: Dish | null = null;
  @Input() isEditMode: boolean = false;
  @Output() saveDish = new EventEmitter<Dish>();
  @Output() deleteDish = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  dishForm: FormGroup;
  imagePreview: string | null = null;

  nivelesPicante = [
    { value: 'ninguno', label: 'Ninguno' },
    { value: 'bajo', label: 'Bajo' },
    { value: 'medio', label: 'Medio' },
    { value: 'alto', label: 'Alto' }
  ];

  constructor(private fb: FormBuilder) {
    this.dishForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      precio: ['', [Validators.required, Validators.min(1000)]],
      nivelPicante: ['ninguno', Validators.required],
      imagen: [null]
    });
  }

  ngOnInit() {
    if (this.dish && this.isEditMode) {
      this.dishForm.patchValue({
        nombre: this.dish.nombre,
        descripcion: this.dish.descripcion,
        precio: this.dish.precio,
        nivelPicante: this.dish.nivelPicante
      });

      if (typeof this.dish.imagen === 'string') {
        this.imagePreview = this.dish.imagen;
      }
    }
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.dishForm.patchValue({ imagen: file });
      
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.dishForm.valid) {
      const formData: Dish = {
        ...this.dishForm.value,
        id: this.dish?.id,
        imagen: this.dishForm.value.imagen || this.dish?.imagen || null
      };
      this.saveDish.emit(formData);
    } else {
      Object.keys(this.dishForm.controls).forEach(key => {
        this.dishForm.get(key)?.markAsTouched();
      });
    }
  }

  onDelete() {
    if (this.dish?.id && confirm('¿Estás seguro de que deseas eliminar este plato?')) {
      this.deleteDish.emit(this.dish.id);
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  get nombre() { return this.dishForm.get('nombre'); }
  get descripcion() { return this.dishForm.get('descripcion'); }
  get precio() { return this.dishForm.get('precio'); }
  get nivelPicante() { return this.dishForm.get('nivelPicante'); }
}

