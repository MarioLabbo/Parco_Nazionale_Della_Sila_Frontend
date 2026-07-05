import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

// Porta l'utente nelle schermate apposite basandosi sul token
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('jwt_token');

    if (token) {
      // Il token esiste nel LocalStorage, l'utente è autenticato!
      return true;
    }

    // Nessun token trovato: reindirizza forzatamente al login
    console.warn('Accesso negato dall AuthGuard: Token mancante. Reindirizzamento...');
    this.router.navigate(['/login']);
    return false;
  }
}
