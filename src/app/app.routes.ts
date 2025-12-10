import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home';
import { CatalogPage } from './pages/catalog/catalog';
import { CartPage } from './pages/cart/cart';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { ProfileComponent } from './pages/profile/profile';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'home', component: HomePage },
  { path: 'catalog', component: CatalogPage, canActivate: [authGuard] },
  { path: 'cart', component: CartPage },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'profile', component: ProfileComponent },
  { path: '**', redirectTo: '' }
];
