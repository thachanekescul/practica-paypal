import { Routes } from '@angular/router';
import { ProductoComponent } from './components/producto/producto.component';
import { CarritoComponent } from './components/carrito/carrito.component';

export const routes: Routes = [
  { path: 'productos', component: ProductoComponent },
  { path: 'carrito', component: CarritoComponent },
  { path: '', redirectTo: '/productos', pathMatch: 'full' }, // Redirigir a productos por defecto
  { path: '**', redirectTo: '/productos' } // Redirigir cualquier ruta no encontrada a productos
];
