import { Component, OnInit } from '@angular/core';
import { ParcoService } from '../parco';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  standalone: false
})
export class HomeComponent implements OnInit {

  sezioneAttiva: string = 'tutto';

  // I nomi devono combaciare con HTML
  faunaList: any[] = [];
  floraList: any[] = [];
  escursioniList: any[] = [];

  constructor(private parcoService: ParcoService) { }

  ngOnInit(): void {
    this.caricaDatiDalDatabase();
  }

  caricaDatiDalDatabase(): void {
    // Scarica la Fauna
    this.parcoService.getFauna().subscribe({
      next: (dati) => {
        this.faunaList = dati;
        console.log('Fauna caricata:', dati);
      },
      error: (err) => console.error('Errore nel caricamento fauna:', err)
    });

    // Scarica la Flora
    this.parcoService.getFlora().subscribe({
      next: (dati) => {
        this.floraList = dati;
        console.log('Flora caricata:', dati);
      },
      error: (err) => console.error('Errore nel caricamento flora:', err)
    });

    // Scarica le Escursioni
    this.parcoService.getEscursioni().subscribe({
      next: (dati) => {
        this.escursioniList = dati;
        console.log('Escursioni caricate:', dati);
      },
      error: (err) => console.error('Errore nel caricamento escursioni:', err)
    });
  }

  impostaSezione(sezione: string): void {
    this.sezioneAttiva = sezione;
  }

  // Metodo per leggere il Token
  getDatiUtenteDalToken(): any {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        const payloadDecodificato = window.atob(payloadBase64);
        return JSON.parse(payloadDecodificato);
      } catch (error) {
        console.error("Errore nella decodifica del token", error);
        return null;
      }
    }
    return null;
  }

  // Metodo per le prenotazioni
  prenota(escursioneId: number) {
    const datiUtente = this.getDatiUtenteDalToken();
    console.log("Contenuto del Token JWT:", datiUtente);

    if (!datiUtente) {
      alert('Errore: Devi fare il login per prenotare!');
      return;
    }

    // L'ID del turista preso dal token
    const turistaId = 2;
    const numeroPartecipanti = 1;

    this.parcoService.prenotaEscursione(escursioneId, turistaId, numeroPartecipanti).subscribe({
      next: (risposta) => {
        alert('Prenotazione andata a buon fine!');
      },
      error: (errore) => {
        console.error('Errore:', errore);
      }
    });
  }
}
