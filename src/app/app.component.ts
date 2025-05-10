import { Component } from '@angular/core';
import { HeaderComponent } from './components/header/header.component'; // Asegúrate de importar el HeaderComponent
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterModule, HeaderComponent], // Asegúrate de agregar HeaderComponent en imports
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'examen';
}
