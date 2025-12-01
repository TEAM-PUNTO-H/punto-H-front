import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";



@Injectable({  providedIn: 'root'})
export class AuthService {
  private router = inject(Router);
  private http = inject(HttpClient);
  responseStatus = signal(200);
  resposeMessage = signal('');

  login(email: string, password: string) {
    this.http.post('http://104.237.5.100:3000/api/users/login', { email, password },
      {observe: 'response'}).subscribe({
        next: (response) => {
          console.log(response);
          alert('Login exitoso');
          this.responseStatus.set(response.status);
          this.resposeMessage.set('Login exitoso');

        },
        error: (error) => {
          alert('Error en el login: ' + error.error.message);
          console.log(error);
          this.responseStatus.set(error.status);
          this.resposeMessage.set(error.error.message);
        }
      })
  }

  register(
    fullName: string,
    email: string,
    password: string,
    role: string,
    phoneNumber: string,
  ){
    this.http.post('http://104.237.5.100:3000/api/users/registerUser', { fullName, email, password, role, phoneNumber },
      {observe: 'response'}).subscribe({
        next: (response) => {
          console.log(response);
          alert('Registro exitoso');
          this.responseStatus.set(response.status);
          this.resposeMessage.set('Registro exitoso');

        },
        error: (error) => {
          alert('Error en el registro: ' + error.error.message);
          console.log(error);
          this.responseStatus.set(error.status);
          this.resposeMessage.set(error.error.message);
        }
      })
  }
}
