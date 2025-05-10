import { Injectable } from '@angular/core';
import { Producto } from '../models/producto';
import { ProductoService } from './producto.service';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {

  constructor(private productoService: ProductoService) {}

  // Método para obtener el inventario desde localStorage como XML
  obtenerInventario(): Producto[] {
    const productosGuardados = localStorage.getItem('productos');
    
    // Si no hay productos guardados, almacenar los productos iniciales en localStorage
    if (!productosGuardados) {
      const productosIniciales = this.productoService.obtenerProducto();
      const productosXML = this.convertirProductosAXML(productosIniciales);  // Convierte los productos iniciales a XML
      localStorage.setItem('productos', productosXML);  // Guardamos el XML en localStorage
      return productosIniciales;  // Devolvemos los productos iniciales
    }
    
    // Si hay datos en localStorage, los convertimos de XML a productos
    return this.convertirXMLAProducto(productosGuardados) || []; // Retorna un arreglo vacío si el parseo falla
  }

  // Método para convertir los productos a XML
  private convertirProductosAXML(productos: Producto[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<productos>\n';
    productos.forEach(producto => {
      xml += `  <producto>\n`;
      xml += `    <id>${producto.id}</id>\n`;
      xml += `    <nombre>${producto.nombre}</nombre>\n`;
      xml += `    <precio>${producto.precio}</precio>\n`;
      xml += `    <imagen>${producto.imagen}</imagen>\n`;
      xml += `    <cantidad>${producto.cantidad}</cantidad>\n`;
      xml += `  </producto>\n`;
    });
    xml += '</productos>';
    return xml;
  }

  // Método para convertir XML a productos
  private convertirXMLAProducto(xmlString: string): Producto[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "application/xml");

    // Verificar si hubo errores en la conversión
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      console.error('Error en el formato XML:', parseError);
      return [];  // Retornar un arreglo vacío si el XML es inválido
    }

    const productosNodeList = xmlDoc.getElementsByTagName("producto");
    let productos: Producto[] = [];
    
    Array.from(productosNodeList).forEach(productoNode => {
      const id = parseInt(productoNode.getElementsByTagName("id")[0].textContent || "0");
      const nombre = productoNode.getElementsByTagName("nombre")[0].textContent || "";
      const precio = parseFloat(productoNode.getElementsByTagName("precio")[0].textContent || "0");
      const imagen = productoNode.getElementsByTagName("imagen")[0].textContent || "";
      const cantidad = parseInt(productoNode.getElementsByTagName("cantidad")[0].textContent || "0");
      
      productos.push(new Producto(id, nombre, precio, imagen, cantidad));
    });
  
    return productos;
  }

  // Método para agregar un producto al localStorage (como XML)
  agregarProductoAlLocalStorage(producto: Producto): void {
    let productos = this.obtenerInventario();
    productos.push(producto); // Agregar el nuevo producto al arreglo
    localStorage.setItem('productos', this.convertirProductosAXML(productos)); // Guardamos el XML actualizado en localStorage
  }

  // Método para actualizar un producto en localStorage (como XML)
  actualizarProducto(producto: Producto): void {
    let productos = this.obtenerInventario();
    const index = productos.findIndex(p => p.id === producto.id);
    if (index !== -1) {
      productos[index] = producto;  // Actualizamos el producto
      localStorage.setItem('productos', this.convertirProductosAXML(productos)); // Guardamos el XML actualizado en localStorage
    }
  }

  // Método para eliminar un producto y actualizar localStorage
  eliminarProducto(id: number): void {
    let productos = this.obtenerInventario();
    productos = productos.filter(producto => producto.id !== id);
    // Actualizamos localStorage con los productos restantes
    localStorage.setItem('productos', this.convertirProductosAXML(productos));
  }

  // Método para generar el XML de los productos
  generarXML(): string {
    const productos = this.obtenerInventario();
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<productos>\n';
    
    productos.forEach(producto => {
      xml += `  <producto>\n`;
      xml += `    <id>${producto.id}</id>\n`;
      xml += `    <nombre>${producto.nombre}</nombre>\n`;
      xml += `    <cantidad>${producto.cantidad}</cantidad>\n`;
      xml += `    <precio>${producto.precio}</precio>\n`;
      xml += `    <imagen>${producto.imagen}</imagen>\n`;
      xml += `  </producto>\n`;
    });
    
    xml += '</productos>';
    
    return xml;
  }
}
