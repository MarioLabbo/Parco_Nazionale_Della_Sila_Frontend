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

  // Metodo per effettuare una prenotazione
  prenotaEscursione(escursioneId: number, turistaId: number, numeroPartecipanti: number): Observable<any> {

        const prenotazioneDTO = {
          escursioneId: escursioneId,
          turistaId: turistaId,
          numeroPartecipanti: numeroPartecipanti
        };
        console.log(" Dati in partenza verso Java:", prenotazioneDTO);

        // Inviamo la POST
        return this.http.post<any>(`${this.baseUrl}/prenotazioni`, prenotazioneDTO);
      }

  // Metodo per creare una nuova escursione (da parte delle guide)
  creaEscursione(escursioneData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/escursioni`, escursioneData);
  }

  // Cerca un utente nel database tramite il suo username (usato dall'Admin per la promozione)
  cercaUtentePerUsername(username: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/utenti/cerca/profilo/${username}`);
  }

  // Promuove il ruolo di un utente da Turista a Guida (riservato all'Admin)
  promuoviAGuida(utenteId: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/utenti/${utenteId}/promuovi`, {});
  }

  // Invia al backend l'ID transazione PayPal per confermare la prenotazione in stato PAGATO
  confermaPagamento(prenotazioneId: number, codiceGateway: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/prenotazioni/${prenotazioneId}/conferma?codiceGateway=${codiceGateway}`, {});
  }

  // Prende il feedback di una specifica escursione
  getFeedbackEscursione(escursioneId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/feedback/escursione/${escursioneId}`);
  }

  // Scrive il feedback (richiamato da Home)
  scriviFeedback(escursioneId: number, turistaId: number, feedbackData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/feedback/escursione/${escursioneId}/turista/${turistaId}`, feedbackData);
  }

  // Annulla un'escursione esistente (riservato a Guide e Admin)
  annullaEscursione(escursioneId: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/escursioni/${escursioneId}/annulla`, {});
  }
}
