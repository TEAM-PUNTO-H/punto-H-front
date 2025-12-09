import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal, computed } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";

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

  // Estado de sesión y rol actual
  private userRoleSignal = signal<string | null>(null);
  private sellerApprovedSignal = signal<boolean | null>(null);
  private userFullNameSignal = signal<string | null>(null);
  private userEmailSignal = signal<string | null>(null);
  private userPhoneSignal = signal<string | null>(null);
  private userAddressSignal = signal<string | null>(null);
  private userMemberSinceSignal = signal<string | null>(null);

  // Signal computed que se actualiza automáticamente cuando cambia userRoleSignal
  isLoggedIn = computed(() => {
    const role = this.userRoleSignal();
    return role !== null && role !== undefined;
  });

  setSession(
    role: string | null, 
    sellerApproved: boolean | null, 
    fullName?: string | null, 
    email?: string | null,
    phone?: string | null,
    address?: string | null
  ) {
    this.userRoleSignal.set(role);
    this.sellerApprovedSignal.set(sellerApproved);
    if (fullName !== undefined) this.userFullNameSignal.set(fullName);
    if (email !== undefined) this.userEmailSignal.set(email);
    if (phone !== undefined) this.userPhoneSignal.set(phone);
    if (address !== undefined) this.userAddressSignal.set(address);
    
    // Si es un nuevo registro, establecer la fecha actual como "Miembro desde"
    if (fullName && !this.userMemberSinceSignal()) {
      const now = new Date();
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const memberSince = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
      this.userMemberSinceSignal.set(memberSince);
    }
  }

  clearSession() {
    this.userRoleSignal.set(null);
    this.sellerApprovedSignal.set(null);
    this.userFullNameSignal.set(null);
    this.userEmailSignal.set(null);
    this.userPhoneSignal.set(null);
    this.userAddressSignal.set(null);
    this.userMemberSinceSignal.set(null);
  }

  // Método para cerrar sesión
  logout(): void {
    this.clearSession();
    this.router.navigate(['/home']);
  }


  userRole() {
    return this.userRoleSignal();
  }

  isSellerApproved() {
    return this.sellerApprovedSignal();
  }

  userFullName() {
    return this.userFullNameSignal();
  }

  userEmail() {
    return this.userEmailSignal();
  }

  userMemberSince() {
    return this.userMemberSinceSignal();
  }

  userPhone() {
    return this.userPhoneSignal();
  }

  userAddress() {
    return this.userAddressSignal();
  }

  login(email: string, password: string): void {
    this.http.post('http://104.237.5.100:3000/api/users/login', { email, password },
      {observe: 'response'}).subscribe({
        next: (response: any) => {
          this.responseStatus.set(response.status);
          
          const body = response.body || {};
          
          // Extraer el role de la respuesta (ahora viene directamente en body.role)
          const userRole = body.role || body.user?.role || null;
          const validRole = (userRole && typeof userRole === 'string' && userRole.trim() !== '') 
            ? userRole.trim() 
            : null;
          
          const sellerApproved = body.user?.sellerApproved !== undefined 
            ? body.user.sellerApproved 
            : (body.sellerApproved !== undefined ? body.sellerApproved : true);

          // Determinar el tipo de respuesta según el rol y estado de aprobación
          let loginResponse: LoginResponse;
          
          if (validRole === 'vendedor' && !sellerApproved) {
            // Vendedor no aprobado
            loginResponse = {
              success: true,
              message: 'Tu solicitud para convertirte en vendedor está en proceso. Recibirás una notificación cuando sea aprobada.',
              type: 'info',
              user: {
                role: validRole || undefined,
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
                role: validRole || undefined,
                sellerApproved: sellerApproved
              }
            };
          }

          // Guardar estado de sesión en memoria
          const userFullName = body.user?.fullName || body.fullName || '';
          const userEmail = body.user?.email || body.email || email;
          const userPhone = body.user?.phoneNumber || body.phoneNumber || '';
          const userAddress = body.user?.direccion || body.direccion || '';
          
          // Actualizar el signal primero para que la UI se actualice inmediatamente
          this.setSession(validRole, sellerApproved, userFullName || null, userEmail || null, userPhone || null, userAddress || null);
          
          // Emitir el resultado después de actualizar el signal
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

          // Limpiar estado de sesión en error
          this.clearSession();

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
    // El backend espera SOLO: fullName, email, password, role, phoneNumber
    // El backend acepta roles: "admin", "vendedor", "moderador" o "comprador"
    // NOTA: El backend NO acepta "direccion" ni otros campos adicionales en el registro inicial
    const registerPayload: any = {
      fullName,
      email,
      password,
      role, // Enviar el rol tal cual (comprador, vendedor, etc.)
      phoneNumber
    };

    // Nota: Los campos adicionales (direccion para compradores, redesSociales, horariosRestaurante, 
    // direccionRestaurante para vendedores) NO se envían al backend en el registro inicial.
    // Estos campos pueden ser parte de un proceso de actualización de perfil posterior.

    this.http.post('http://104.237.5.100:3000/api/users/registerUser', registerPayload,
      {observe: 'response'}).subscribe({
        next: (response: any) => {
          console.log(response);
          this.responseStatus.set(response.status);
          
          // Establecer sesión con el rol registrado para que la UI muestre las opciones correctas
          const isSeller = role === 'vendedor';
          // Para vendedores, usar direccionRestaurante si existe, para compradores usar direccionCliente
          const address = isSeller && vendedorData?.direccionRestaurante 
            ? vendedorData.direccionRestaurante 
            : (!isSeller ? direccionCliente || null : null);
          this.setSession(role || null, isSeller ? true : null, fullName || null, email || null, phoneNumber || null, address);
          
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