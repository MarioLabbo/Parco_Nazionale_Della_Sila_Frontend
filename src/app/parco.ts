import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

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

  // Metodo per effettuare una prenotazione
  prenotaEscursione(escursioneId: number, turistaId: number, numeroPartecipanti: number): Observable<any> {

        const prenotazioneDTO = {
          escursioneId: escursioneId,
          turistaId: turistaId,
          numeroPartecipanti: numeroPartecipanti
        };
        console.log("📦 Dati in partenza verso Java:", prenotazioneDTO);
        // Recuperiamo il token salvato
        const token = localStorage.getItem('jwt_token');

        // Creiamo l'header di Autorizzazione standard (Bearer Token)
        let headers = new HttpHeaders();
        if (token) {
          headers = headers.set('Authorization', 'Bearer ' + token);
        }

        // Inviamo la POST con gli headers
        return this.http.post<any>(`${this.baseUrl}/prenotazioni`, prenotazioneDTO, { headers: headers });
      }
}
