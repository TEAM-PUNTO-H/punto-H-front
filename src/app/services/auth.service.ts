import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, Subject } from "rxjs";

export interface LoginResponse {
  success: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
  user?: {
    role?: string;
    sellerApproved?: boolean;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({  providedIn: 'root'})
export class AuthService {
  private router = inject(Router);
  private http = inject(HttpClient);
  responseStatus = signal(200);
  resposeMessage = signal('');
  private loginResultSubject = new Subject<LoginResponse>();
  loginResult$ = this.loginResultSubject.asObservable();
  
  private registerResultSubject = new Subject<RegisterResponse>();
  registerResult$ = this.registerResultSubject.asObservable();

  login(email: string, password: string): void {
    this.http.post('http://104.237.5.100:3000/api/users/login', { email, password },
      {observe: 'response'}).subscribe({
        next: (response: any) => {
          console.log(response);
          this.responseStatus.set(response.status);
          
          const body = response.body || {};
          const userRole = body.user?.role || body.role || '';
          const sellerApproved = body.user?.sellerApproved !== undefined 
            ? body.user.sellerApproved 
            : (body.sellerApproved !== undefined ? body.sellerApproved : true);

          // Determinar el tipo de respuesta según el rol y estado de aprobación
          let loginResponse: LoginResponse;
          
          if (userRole === 'vendedor' && !sellerApproved) {
            // Vendedor no aprobado
            loginResponse = {
              success: true,
              message: 'Tu solicitud para convertirte en vendedor está en proceso. Recibirás una notificación cuando sea aprobada.',
              type: 'info',
              user: {
                role: userRole,
                sellerApproved: sellerApproved
              }
            };
          } else {
            // Login exitoso (cliente o vendedor aprobado)
            loginResponse = {
              success: true,
              message: 'Inicio de sesión exitoso. ¡Bienvenido!',
              type: 'success',
              user: {
                role: userRole,
                sellerApproved: sellerApproved
              }
            };
          }

          this.loginResultSubject.next(loginResponse);
          this.resposeMessage.set(loginResponse.message);
        },
        error: (error: any) => {
          console.log(error);
          this.responseStatus.set(error.status || 500);
          
          const errorMessage = error.error?.message || 'El usuario no existe o las credenciales son incorrectas.';
          
          const loginResponse: LoginResponse = {
            success: false,
            message: `Error: ${errorMessage}`,
            type: 'error'
          };

          this.loginResultSubject.next(loginResponse);
          this.resposeMessage.set(loginResponse.message);
        }
      })
  }

  register(
    fullName: string,
    email: string,
    password: string,
    role: string,
    phoneNumber: string,
    vendedorData?: {
      redesSociales?: string;
      horariosRestaurante?: string;
      direccionRestaurante?: string;
    },
    direccionCliente?: string
  ): void {
    // Construir el objeto de registro según el tipo de usuario
    const registerPayload: any = {
      fullName,
      email,
      password,
      role,
      phoneNumber
    };

    // Agregar campos según el tipo de usuario
    if (role === 'vendedor' && vendedorData) {
      // registerPayload.redesSociales = vendedorData.redesSociales;  --> Solucionar
      // registerPayload.horariosRestaurante = vendedorData.horariosRestaurante; --> Solucionar
      // registerPayload.direccionRestaurante = vendedorData.direccionRestaurante; --> Solucionar
    } else if (role === 'comprador' && direccionCliente) {
      // registerPayload.direccion = direccionCliente;
    }

    this.http.post('http://104.237.5.100:3000/api/users/registerUser', registerPayload,
      {observe: 'response'}).subscribe({
        next: (response: any) => {
          console.log(response);
          this.responseStatus.set(response.status);
          
          const registerResponse: RegisterResponse = {
            success: true,
            message: 'Registro exitoso',
            type: 'success'
          };

          this.registerResultSubject.next(registerResponse);
          this.resposeMessage.set(registerResponse.message);
        },
        error: (error: any) => {
          console.log(error);
          this.responseStatus.set(error.status || 500);
          
          const errorMessage = error.error?.message || 'Error al registrar. Por favor, intenta nuevamente.';
          
          const registerResponse: RegisterResponse = {
            success: false,
            message: `Error: ${errorMessage}`,
            type: 'error'
          };

          this.registerResultSubject.next(registerResponse);
          this.resposeMessage.set(registerResponse.message);
        }
      })
  }
}
