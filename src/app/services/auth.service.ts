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
  private sellerStateSignal = signal<string | null>(null); // 'pendiente' | 'activo' | null
  private userFullNameSignal = signal<string | null>(null);
  private userEmailSignal = signal<string | null>(null);
  private userPhoneSignal = signal<string | null>(null);
  private userAddressSignal = signal<string | null>(null);
  private userMemberSinceSignal = signal<string | null>(null);
  private userIdSignal = signal<number | null>(null);

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
    address?: string | null,
    sellerState?: string | null,
    userId?: number | null
  ) {
    this.userRoleSignal.set(role);
    this.sellerApprovedSignal.set(sellerApproved);
    if (sellerState !== undefined) this.sellerStateSignal.set(sellerState);
    if (fullName !== undefined) this.userFullNameSignal.set(fullName);
    if (email !== undefined) this.userEmailSignal.set(email);
    if (phone !== undefined) this.userPhoneSignal.set(phone);
    if (address !== undefined) this.userAddressSignal.set(address);
    if (userId !== undefined) this.userIdSignal.set(userId);
    
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
    this.sellerStateSignal.set(null);
    this.userFullNameSignal.set(null);
    this.userEmailSignal.set(null);
    this.userPhoneSignal.set(null);
    this.userAddressSignal.set(null);
    this.userMemberSinceSignal.set(null);
    this.userIdSignal.set(null);
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

  sellerState() {
    return this.sellerStateSignal();
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

  userId() {
    return this.userIdSignal();
  }

  login(email: string, password: string): void {
    this.http.post('http://104.237.5.100:3000/api/users/login', { email, password },
      {observe: 'response'}).subscribe({
        next: (response: any) => {
          // Mostrar datos completos del backend en la consola
          console.log('=== DATOS DEL BACKEND AL INICIAR SESIÓN ===');
          console.log('Respuesta completa:', response);
          console.log('Status:', response.status);
          console.log('Headers:', response.headers);
          console.log('Body completo:', response.body);
          console.log('==========================================');
          
          this.responseStatus.set(response.status);
          
          const body = response.body || {};
          
          // Extraer el role de la respuesta (ahora viene directamente en body.role)
          const userRole = body.role || body.user?.role || null;
          const validRole = (userRole && typeof userRole === 'string' && userRole.trim() !== '') 
            ? userRole.trim() 
            : null;
          
          // Extraer el estado del vendedor (state: 'pendiente' | 'activo')
          const sellerState = body.state || body.user?.state || null;
          const validSellerState = (sellerState && typeof sellerState === 'string') 
            ? sellerState.trim().toLowerCase() 
            : null;
          
          // Mantener compatibilidad con sellerApproved para otros usos
          const sellerApproved = validSellerState === 'activo' 
            ? true 
            : (validSellerState === 'pendiente' ? false : true);

          // Siempre mostrar éxito en el login, independientemente del estado del vendedor
          // El mensaje de estado pendiente se mostrará en la pestaña de Mi restaurante
          const loginResponse: LoginResponse = {
            success: true,
            message: 'Inicio de sesión exitoso. ¡Bienvenido!',
            type: 'success',
            user: {
              role: validRole || undefined,
              sellerApproved: sellerApproved
            }
          };

          // Guardar estado de sesión en memoria
          const userFullName = body.user?.fullName || body.fullName || '';
          const userEmail = body.user?.email || body.email || email;
          const userPhone = body.user?.phoneNumber || body.phoneNumber || '';
          const userAddress = body.user?.direccion || body.direccion || '';
          const userId = body.user?.id || body.id || null;
          
          // Mostrar datos procesados en consola
          console.log('=== DATOS PROCESADOS ===');
          console.log('Rol:', validRole);
          console.log('Estado del vendedor (state):', validSellerState);
          console.log('Seller Approved:', sellerApproved);
          console.log('Nombre completo:', userFullName);
          console.log('Email:', userEmail);
          console.log('Teléfono:', userPhone);
          console.log('Dirección:', userAddress);
          console.log('ID Usuario:', userId);
          console.log('Datos del usuario (body.user):', body.user);
          console.log('========================');
          
          // Actualizar el signal primero para que la UI se actualice inmediatamente
          this.setSession(validRole, sellerApproved, userFullName || null, userEmail || null, userPhone || null, userAddress || null, validSellerState, userId);
          
          // Emitir el resultado después de actualizar el signal
          this.loginResultSubject.next(loginResponse);
          this.resposeMessage.set(loginResponse.message);
        },
        error: (error: any) => {
          // Mostrar datos de error del backend en la consola
          console.log('=== ERROR AL INICIAR SESIÓN ===');
          console.log('Error completo:', error);
          console.log('Status:', error.status);
          console.log('Error body:', error.error);
          console.log('Mensaje de error:', error.error?.message || error.message);
          console.log('================================');
          
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
          
          const body = response.body || {};
          const userId = body.user?.id || body.id || null;
          
          // Establecer sesión con el rol registrado para que la UI muestre las opciones correctas
          const isSeller = role === 'vendedor';
          // Para vendedores, usar direccionRestaurante si existe, para compradores usar direccionCliente
          const address = isSeller && vendedorData?.direccionRestaurante 
            ? vendedorData.direccionRestaurante 
            : (!isSeller ? direccionCliente || null : null);
          // Cuando un vendedor se registra, su estado inicial es 'pendiente'
          const sellerState = isSeller ? 'pendiente' : null;
          this.setSession(role || null, isSeller ? false : null, fullName || null, email || null, phoneNumber || null, address, sellerState, userId);
          
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