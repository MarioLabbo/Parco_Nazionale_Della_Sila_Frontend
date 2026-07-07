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

  // Metodo per creare una nuova escursione (da parte delle guide)
  creaEscursione(escursioneData: any): Observable<any> {
    const token = localStorage.getItem('jwt_token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', 'Bearer ' + token);
    }
    return this.http.post<any>(`${this.baseUrl}/escursioni`, escursioneData, { headers: headers });
  }

  // Cerca un utente nel database tramite il suo username (usato dall'Admin per la promozione)
  cercaUtentePerUsername(username: string): Observable<any> {
    const token = localStorage.getItem('jwt_token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', 'Bearer ' + token);
    }
    return this.http.get<any>(`${this.baseUrl}/utenti/cerca/profilo/${username}`, { headers: headers });
  }

  // Promuove il ruolo di un utente da Turista a Guida (riservato all'Admin)
  promuoviAGuida(utenteId: number): Observable<any> {
    const token = localStorage.getItem('jwt_token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', 'Bearer ' + token);
    }
    return this.http.put<any>(`${this.baseUrl}/utenti/${utenteId}/promuovi`, {}, { headers: headers });
  }

  // Invia al backend l'ID transazione PayPal per confermare la prenotazione in stato PAGATO
  confermaPagamento(prenotazioneId: number, codiceGateway: string): Observable<any> {
    const token = localStorage.getItem('jwt_token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', 'Bearer ' + token);
    }
    return this.http.put<any>(`${this.baseUrl}/prenotazioni/${prenotazioneId}/conferma?codiceGateway=${codiceGateway}`, {}, { headers: headers });
  }

  getFeedbackEscursione(escursioneId: number): Observable<any[]> {
    const token = localStorage.getItem('jwt_token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', 'Bearer ' + token);
    }
    return this.http.get<any[]>(`${this.baseUrl}/feedback/escursione/${escursioneId}`, { headers: headers });
  }

  scriviFeedback(escursioneId: number, turistaId: number, feedbackData: any): Observable<any> {
    const token = localStorage.getItem('jwt_token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', 'Bearer ' + token);
    }
    return this.http.post<any>(`${this.baseUrl}/feedback/escursione/${escursioneId}/turista/${turistaId}`, feedbackData, { headers: headers });
  }
}
