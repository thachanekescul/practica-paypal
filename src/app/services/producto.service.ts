import { Injectable } from '@angular/core';
import { Producto } from '../models/producto';
@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  
  private productosIniciales: Producto[] = [
     new Producto(1, 'DATA', 1200, 'assets/foto1.png',10),
    new Producto(2, 'dtmf', 899, 'assets/foto2.png',10),
    new Producto(3, 'duolingo peluche', 6666, 'assets/foto3.png',666),
  ];

  constructor() {
    this.cargarProductosEnLocalStorage(); // Cargar productos al iniciar
  }

  // Guardar un XML de ejemplo en localStorage si no existe uno
  private cargarProductosEnLocalStorage(): void {
    let productosGuardados = localStorage.getItem('productos');
    
    if (!productosGuardados) {
      // Si no hay productos guardados, guardamos un XML de ejemplo
      const productosXML = this.convertirProductosAXML(this.productosIniciales);  // Convierte los productos iniciales a XML
      localStorage.setItem('productos', productosXML);  // Guardamos el XML en localStorage
    }
  }

  // Convertir productos a XML
  private convertirProductosAXML(productos: Producto[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<productos>\n';
    productos.forEach(producto => {
      xml += `  <producto>\n`;
      xml += `    <id>${producto.id}</id>\n`;
      xml += `    <nombre>${this.escapeXML(producto.nombre)}</nombre>\n`;
      xml += `    <precio>${producto.precio}</precio>\n`;
      xml += `    <imagen>${this.escapeXML(producto.imagen)}</imagen>\n`;
      xml += `  </producto>\n`;
    });
    xml += '</productos>';
  

    return xml;
  }

  private escapeXML(str: string): string {
    return str.replace(/[&<>"']/g, (char) => {
      const charMap: any = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;',
      };
      return charMap[char] || char;
    });
  }

  // Convertir XML a productos
  private convertirXMLAProducto(xmlString: string): Producto[] {
    console.log("XML a analizar:", xmlString);  // Imprimir el XML antes de analizarlo
    
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
      const imagen = productoNode.getElementsByTagName("imagen")[0].textContent || "";;
      
      productos.push(new Producto(id, nombre, precio, imagen, 0));
    });
  
    return productos;
  }

  // Obtener los productos desde localStorage (como XML)
  obtenerProducto(): Producto[] {
    const productosGuardados = localStorage.getItem('productos');
    if (productosGuardados) {
      try {
        return this.convertirXMLAProducto(productosGuardados); // Convertimos el XML de nuevo a productos
      } catch (error) {
        console.error('Error al analizar XML:', error);
        return [];
      }
    } else {
      return [];
    }
  }

  // Método para actualizar un producto en localStorage (como XML)
  actualizarProducto(producto: Producto): void {
    let productos = this.obtenerProducto();
    const index = productos.findIndex(p => p.id === producto.id);
    if (index !== -1) {
      productos[index] = producto;  // Actualizamos el producto
      localStorage.setItem('productos', this.convertirProductosAXML(productos));  // Guardamos el XML actualizado en localStorage
    }
  }

}
