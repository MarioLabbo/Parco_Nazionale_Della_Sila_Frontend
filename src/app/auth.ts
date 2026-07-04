import { Injectable } from '@angular/core'; // Inietta il servizio se richiesto automaticamente
import { HttpClient } from '@angular/common/http'; // Chiamate HTTP
import { Observable } from 'rxjs'; // Evita il blocco del sito durante il passaggio dati

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // L'indirizzo base dei dati su Spring Boot
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) { }

  // Metodo per la registrazione
  register(datiRegistrazione: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, datiRegistrazione);
  }

  // Metodo per il login
  login(credenziali: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credenziali);
  }

  // Metodo di utilità per salvare il token nel browser
  salvaToken(token: string, ruolo: string) {
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('user_role', ruolo);
  }

  // Metodo per capire se l'utente è attualmente loggato
  isLogged(): boolean {
    return localStorage.getItem('jwt_token') !== null;
  }

  // Metodo per fare il logout
  logout() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
  }
}
