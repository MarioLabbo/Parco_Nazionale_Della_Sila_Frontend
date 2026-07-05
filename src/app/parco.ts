import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParcoService {

  // URL del backend
  private baseUrl = 'http://localhost:8080/api';

  // Iniettiamo l'HttpClient per fare le chiamate di rete
  constructor(private http: HttpClient) { }

  // Get per i dati
  getFauna(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/fauna`);
  }

  getFlora(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/flora`);
  }

  getEscursioni(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/escursioni`);
  }
}
