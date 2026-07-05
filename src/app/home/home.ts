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

  // Le liste ora nascono vuote
  faunaList: any[] = [];
  floraList: any[] = [];
  escursioniList: any[] = [];

  // Iniettiamo il nostro nuovo servizio nel costruttore
  constructor(private parcoService: ParcoService) { }

  // Questo metodo scatta appena si apre la Home
  ngOnInit(): void {
    this.caricaDatiDalDatabase();
  }

  caricaDatiDalDatabase(): void {
    // 1. Scarica la Fauna
    this.parcoService.getFauna().subscribe({
      next: (dati) => {
        this.faunaList = dati;
        console.log('Fauna caricata:', dati);
      },
      error: (err) => console.error('Errore nel caricamento fauna:', err)
    });

    // 2. Scarica la Flora
    this.parcoService.getFlora().subscribe({
      next: (dati) => {
        this.floraList = dati;
        console.log('Flora caricata:', dati);
      },
      error: (err) => console.error('Errore nel caricamento flora:', err)
    });

    // 3. Scarica le Escursioni
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
}
