import { Injectable } from "@angular/core";
import { Producto } from "../models/producto";
import { ProductoService } from './producto.service'; // Asegúrate de importar el ProductoService

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private carrito: Producto[] = [];

  constructor(private productoService: ProductoService) {
    // Cargar el carrito desde localStorage si está disponible
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      this.carrito = JSON.parse(carritoGuardado);
    }
  }

  // Agregar un producto al carrito
  agregarProducto(producto: Producto) {
    // Verificamos si el producto ya está en el carrito
    const productoExistente = this.carrito.find(p => p.id === producto.id);
    
    if (productoExistente) {
      // Si el producto ya existe, incrementamos la cantidad
      productoExistente.cantidad += 1;
    } else {
      // Si el producto no está en el carrito, lo agregamos con cantidad 1
      producto.cantidad = 1;
      this.carrito.push(producto);
    }
  
    this.guardarCarrito(); // Guardamos el carrito actualizado en el localStorage
  }

  // Obtener el carrito desde localStorage
  obtenerCarrito(): Producto[] {
    return this.carrito;
  }

  // Eliminar un producto del carrito
  eliminarProducto(index: number) {
    if (index >= 0 && index < this.carrito.length) {
      this.carrito.splice(index, 1);
      this.guardarCarrito(); // Guardamos el carrito actualizado
    }
  }

  // Calcular el subtotal del carrito
  calcularSubtotal(): number {
    return this.carrito.reduce((total, producto) => total + (producto.precio * producto.cantidad), 0);
  }

  // Calcular el IVA
  calcularIVA(): number {
    return this.calcularSubtotal() * 0.16; // IVA del 16%
  }

  // Calcular el total
  calcularTotal(): number {
    return this.calcularSubtotal() + this.calcularIVA();
  }

  // En carrito.service.ts
  generarXML(): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<compra>\n';
      
    this.carrito.forEach((producto) => {
      xml +=   `<producto id="${producto.id}" cantidad="${producto.cantidad}">\n`;
      xml +=     `<nombre>${producto.nombre}</nombre>\n`;
      xml +=     `<precio>${producto.precio}</precio>\n`;
      xml +=   `</producto>\n`;
    });
    
    const subtotal = this.calcularSubtotal();
    const iva = this.calcularIVA();
    const total = this.calcularTotal();
    
    xml +=   `<subtotal>${subtotal.toFixed(2)}</subtotal>\n`;
    xml +=   `<iva>${iva.toFixed(2)}</iva>\n`;
    xml +=   `<total>${total.toFixed(2)}</total>\n`;
    xml +=   `<tienda>Gracias por tu compra en ChinoSneakers</tienda>\n`;
    
    xml += '</compra>';
      
    // No limpies el carrito aquí, déjalo para después del pago
    return xml;
  }
  // Guardar el carrito en localStorage
  private guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(this.carrito));
  }


  // En carrito.service.ts
  limpiarCarrito() {
    this.carrito = [];
    localStorage.removeItem('carrito');
  }

  
}
