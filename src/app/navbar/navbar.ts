import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  standalone: false
})
export class NavbarComponent {

  constructor(private router: Router) {}

  // Controlla se il token esiste
  isLoggedIn(): boolean {
    return !!localStorage.getItem('jwt_token');
  }

  // Recupera il ruolo salvato per eventuali messaggi personalizzati
  getRuolo(): string | null {
    return localStorage.getItem('user_role');
  }

  // Funzione di Logout: svuota le tasche del browser e rispedisce al login
  logout() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    console.log('Sessione terminata. Arrivederci!');
    this.router.navigate(['/login']);
  }
}
