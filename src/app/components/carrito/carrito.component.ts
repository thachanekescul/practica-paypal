import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarritoService } from '../../services/carrito.service';
import { Router } from '@angular/router';

declare var paypal: any;

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css'],
})
export class CarritoComponent implements AfterViewInit, OnDestroy {
  carrito: any[] = [];
  recibo: string = ''; 
  subtotal: number = 0;
  iva: number = 0;
  total: number = 0;
  private paypalButton: any;

  constructor(private carritoService: CarritoService, private router: Router) {}

  ngOnInit() {
    this.actualizarCarrito();
  }

  ngAfterViewInit() {
    // No cargamos el botón aquí, lo haremos cuando se genere el recibo
  }

  ngOnDestroy() {
    if (this.paypalButton) {
      this.paypalButton.close();
    }
  }

  private loadPayPalButton() {
    console.log('Intentando cargar botón PayPal...');
    
    const container = document.getElementById('paypal-button-container');
    if (!container) {
      console.error('Contenedor PayPal no encontrado');
      return;
    }
  
    console.log('Contenedor encontrado:', container);
    container.innerHTML = '';
  
    if (typeof paypal === 'undefined') {
      console.error('PayPal SDK no está disponible');
      return;
    }
  
    console.log('PayPal SDK está disponible:', paypal);
  
    try {
      // Variable para almacenar los detalles del pago
      let paymentDetails: any = null;
  
      this.paypalButton = paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'gold',
          layout: 'vertical',
          label: 'paypal',
          height: 30
        },
        createOrder: (data: any, actions: any) => {
          console.log('Creando orden con total:', this.total);
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: this.total.toFixed(2),
                currency_code: 'USD'
              }
            }]
          });
        },
        onApprove: (data: any, actions: any) => {
          console.log('Pago aprobado:', data);
          return actions.order.capture().then((details: any) => {
            // Guardamos los detalles del pago para usarlos después
            paymentDetails = details;
            
            // 1. Limpiar el carrito
            this.carritoService.limpiarCarrito();
            
            // 2. Actualizar el estado del componente
            this.actualizarCarrito();
          });
        },
        onError: (err: any) => {
          console.error('Error en PayPal:', err);
          paymentDetails = { error: err };
        },
        onCancel: (data: any) => {
          console.log('Pago cancelado:', data);
          paymentDetails = { cancelled: true };
        },
        onClose: () => {
          console.log('Modal de PayPal cerrada');
          // Mostramos la alerta solo cuando la modal se cierra
          if (paymentDetails && !paymentDetails.error && !paymentDetails.cancelled) {
            alert(`¡Pago completado con éxito! Gracias por tu compra, ${paymentDetails.payer.name.given_name}`);
            this.router.navigate(['/productos']);
          } else if (paymentDetails?.error) {
            alert('Error en el pago: ' + paymentDetails.error.message);
          }
        }
      });
  
      console.log('Botón PayPal creado:', this.paypalButton);
  
      if (this.paypalButton.isEligible()) {
        console.log('El botón es elegible, renderizando...');
        this.paypalButton.render('#paypal-button-container').then(() => {
          console.log('Botón renderizado con éxito');
        });
      } else {
        console.warn('El botón PayPal no es elegible');
        container.innerHTML = '<p>PayPal no disponible</p>';
      }
    } catch (error) {
      console.error('Error al crear botón PayPal:', error);
      container.innerHTML = '<p>Error al cargar PayPal</p>';
    }
  }

generarXML() {
  this.recibo = this.carritoService.generarXML();
  this.actualizarCarrito();
  
  console.log('Total actual:', this.total);
  
  if (this.total <= 0) {
    console.warn('El total debe ser mayor que 0 para mostrar PayPal');
    return;
  }

  setTimeout(() => {
    this.loadPayPalButton();
  }, 0);
}

  // Resto de tus métodos permanecen igual...
  eliminarProducto(index: number) {
    const producto = this.carrito[index];
    this.carritoService.eliminarProducto(index);
    this.actualizarCarrito();
  }

  descargarXML() {
    if (!this.recibo) return;

    const blob = new Blob([this.recibo], { type: 'application/xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'recibo.xml'; 
    link.click();
  }

  actualizarCarrito() {
    this.carrito = this.carritoService.obtenerCarrito();
    this.subtotal = this.carritoService.calcularSubtotal();
    this.iva = this.carritoService.calcularIVA();
    this.total = this.carritoService.calcularTotal();
  }

  modificarCantidad(index: number, cantidad: number) {
    const producto = this.carrito[index];
    
    if (producto.cantidad + cantidad >= 1) {
      producto.cantidad += cantidad;
    }
    
    this.actualizarCarrito();
  }



  regresar(): void {
    this.router.navigate(['/productos']);
  }
}