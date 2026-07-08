import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ParcoService } from '../parco';

// Comunica a TypeScript che "paypal" è caricato globalmente dall'index.html
declare var paypal: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  standalone: false
})
export class HomeComponent implements OnInit, OnDestroy {

  sezioneAttiva: string = 'tutto';
  private timerIntervallo: any;

  // I nomi devono combaciare con HTML
  faunaList: any[] = [];
  floraList: any[] = [];
  escursioniList: any[] = [];
  escursioneInPagamentoId: number | null = null;
  prenotazioneCorrenteId!: number;

  // Variabili per il form di creazione escursione
  mostraModaleCreaEscursione = false;
  nuovoTitolo = '';
  nuovaDescrizione = '';
  nuovaDifficolta = 'BASSA';
  nuoviPostiTotali = 10;
  nuovaDataOrario = '';
  erroreCreazione = '';

  // Variabili per il dettaglio di Fauna/Flora
  elementoSelezionato: any = null;
  tipoElementoSelezionato: 'fauna' | 'flora' | null = null;

  // Variabili per la gestione dei feedback
  escursioneSelezionataFeedback: any = null;
  mostraPopUpNonConclusa = false;
  valutazioneNuovoFeedback = 5;
  commentoNuovoFeedback = '';
  erroreFeedback = '';

  constructor(private parcoService: ParcoService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.caricaDatiDalDatabase();
    // Esegue il check per le escursioni scadute ogni 10 secondi
    this.timerIntervallo = setInterval(() => {
      this.checkEscursioniScadute();
    }, 10000);
  }

  ngOnDestroy(): void {
    if (this.timerIntervallo) {
      clearInterval(this.timerIntervallo);
    }
  }

  caricaDatiDalDatabase(): void {
    // Scarica Fauna
    this.parcoService.getFauna().subscribe({
      next: (dati) => this.faunaList = dati,
      error: (err) => console.error('Errore nel caricamento fauna:', err)
    });
    // Scarica Flora
    this.parcoService.getFlora().subscribe({
      next: (dati) => this.floraList = dati,
      error: (err) => console.error('Errore nel caricamento flora:', err)
    });
    // Scarica Escursioni
    this.parcoService.getEscursioni().subscribe({
      next: (dati) => {
        this.escursioniList = dati;
        this.checkEscursioniScadute();
        console.log('Escursioni caricate:', dati);
      },
      error: (err) => console.error('Errore nel caricamento escursioni:', err)
    });
  }

  impostaSezione(sezione: string): void {
    this.sezioneAttiva = sezione;
  }

  // Estrae il token
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

  // Metodo che esegue la prenotazione
  prenota(escursioneId: number, partecipantiStr: string) {
    const datiUtente = this.getDatiUtenteDalToken();
    if (!datiUtente) {
      alert('Errore: Devi fare il login per prenotare!');
      return;
    }

    const numeroPartecipanti = parseInt(partecipantiStr, 10);
    const turistaId = datiUtente.id || 2; // Usa l'id dell'utente loggato, con fallback a 2

    this.parcoService.prenotaEscursione(escursioneId, turistaId, numeroPartecipanti).subscribe({
      next: (rispostaJava) => {
        console.log("Prenotazione salvata in IN_ATTESA:", rispostaJava);

        this.prenotazioneCorrenteId = rispostaJava.id;
        this.escursioneInPagamentoId = escursioneId;
        this.cdr.detectChanges(); // Forza il refresh del DOM per rendere visibile il container

        // Garantisce che Angular aggiorni la classe .active sul DOM prima del rendering di PayPal
        setTimeout(() => {
          this.inizializzaPaypal(rispostaJava.prezzoUnico, escursioneId);
        }, 0);
      },
      error: (errore) => {
        console.error('Errore durante la prenotazione:', errore);
        alert(errore.error?.message || 'Errore durante la creazione della prenotazione.');
      }
    });
  }

  // Gestisce l'interfaccia protetta e il popup di PayPal
  inizializzaPaypal(prezzoTotale: number, escursioneId: number): void {
    const selectorId = '#paypal-button-container';

    const container = document.getElementById('paypal-button-container');
    if (!container) {
      console.error("ERRORE CRITICO: Il container PayPal non esiste ancora nel DOM!");
      return;
    }

    container.innerHTML = '';

    paypal.Buttons({
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              currency_code: 'EUR',
              value: prezzoTotale.toString()
            },
            custom_id: this.prenotazioneCorrenteId.toString()
          }]
        });
      },
      onApprove: (data: any, actions: any) => {
        return actions.order.capture().then((details: any) => {
          const transazioneId = details.purchase_units?.[0]?.payments?.captures?.[0]?.id || data.orderID || 'SANDBOX';
          this.parcoService.confermaPagamento(this.prenotazioneCorrenteId, transazioneId).subscribe({
            next: () => {
              alert('Pagamento completato e registrato con successo! Ti è stata inviata l\'email di conferma.');
              this.chiudiModalePagamento();
              this.caricaDatiDalDatabase();
            },
            error: (err) => {
              console.error('Errore conferma pagamento backend:', err);
              alert('Pagamento autorizzato PayPal, ma si è verificato un errore nel salvataggio sul server.');
              this.chiudiModalePagamento();
              this.caricaDatiDalDatabase();
            }
          });
        });
      },
      onError: (err: any) => {
        console.error('Errore durante il checkout PayPal:', err);
        alert('Il pagamento è stato annullato o si è verificato un problema tecnico.');
      }
    }).render(selectorId);
  }

  chiudiModalePagamento(): void {
    this.escursioneInPagamentoId = null;
    this.cdr.detectChanges();
  }

  // Controlla se l'utente è Guida o Admin per creare le escursioni
  isGuidaOAdmin(): boolean {
    const dati = this.getDatiUtenteDalToken();
    return dati && (dati.role === 'GUIDA' || dati.role === 'ADMIN');
  }

  // Metodo che gestisce la visualizzazione della finestra di creazione di un'escursione
  apriModaleCreaEscursione(): void {
    this.mostraModaleCreaEscursione = true;
    this.nuovoTitolo = '';
    this.nuovaDescrizione = '';
    this.nuovaDifficolta = 'BASSA';
    this.nuoviPostiTotali = 10;
    this.nuovaDataOrario = '';
    this.erroreCreazione = '';
    this.cdr.detectChanges();
  }

  chiudiModaleCreaEscursione(): void {
    this.mostraModaleCreaEscursione = false;
    this.cdr.detectChanges();
  }

  // Metodo che gestisce la creazione di una nuova escursione
  onCreaEscursione(): void {
    const datiUtente = this.getDatiUtenteDalToken();
    if (!datiUtente) {
      alert('Sessione non valida.');
      return;
    }

    let formattedDate = this.nuovaDataOrario;
    if (formattedDate && formattedDate.length === 16) {
      formattedDate += ':00';
    }

    const payload = {
      titolo: this.nuovoTitolo,
      descrizione: this.nuovaDescrizione,
      difficolta: this.nuovaDifficolta,
      postiTotali: this.nuoviPostiTotali,
      postiDisponibili: this.nuoviPostiTotali,
      dataOrario: formattedDate,
      stato: 'PROGRAMMATA',
      guidaId: datiUtente.id
    };

    this.parcoService.creaEscursione(payload).subscribe({
      next: (nuovaEsc) => {
        alert('Escursione creata con successo!');
        this.chiudiModaleCreaEscursione();
        this.caricaDatiDalDatabase();
      },
      error: (err) => {
        console.error('Errore durante la creazione:', err);
        this.erroreCreazione = err.error?.message || 'Impossibile creare l\'escursione.';
        this.cdr.detectChanges();
      }
    });
  }

  // Apre il pop-up dei dettagli per una specifica specie faunistica o vegetale
  apriDettaglio(elemento: any, tipo: 'fauna' | 'flora'): void {
    this.elementoSelezionato = elemento;
    this.tipoElementoSelezionato = tipo;
    this.cdr.detectChanges();
  }

  // Chiude il pop-up dei dettagli pulendo lo stato
  chiudiDettaglio(): void {
    this.elementoSelezionato = null;
    this.tipoElementoSelezionato = null;
    this.cdr.detectChanges();
  }

  // Costruisce l'URL dell'immagine di sfondo per il pop-up basandosi sul nome dell'elemento sanitizzato
  getImageUrl(): string {
    if (!this.elementoSelezionato) return 'none';
    // Sanitizza il nome per creare un nome di file pulito (es. "Lupo della Sila" -> "lupo_della_sila")
    const sanitizedNome = this.elementoSelezionato.nome
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_');

    const path = this.tipoElementoSelezionato === 'fauna' ? 'fauna' : 'flora';
    return `url('/images/${path}/${sanitizedNome}.jpg')`;
  }

  // Metodo che apre il modale per inserire un feedback
  apriFeedback(esc: any): void {
    if (esc.stato === 'COMPLETATA') {
      this.escursioneSelezionataFeedback = esc;
      this.valutazioneNuovoFeedback = 5;
      this.commentoNuovoFeedback = '';
      this.erroreFeedback = '';
    } else {
      this.mostraPopUpNonConclusa = true;
    }
    this.cdr.detectChanges();
  }

  chiudiFeedback(): void {
    this.escursioneSelezionataFeedback = null;
    this.cdr.detectChanges();
  }

  chiudiPopUpNonConclusa(): void {
    this.mostraPopUpNonConclusa = false;
    this.cdr.detectChanges();
  }

  // Metodo che seleziona la valutazione
  selezionaStella(valore: number): void {
    this.valutazioneNuovoFeedback = valore;
    this.cdr.detectChanges();
  }

  // Metodo che controlla se le escursioni sono scadute
  checkEscursioniScadute(): void {
    let haSubitoCambiamenti = false;
    const adesso = new Date();
    this.escursioniList.forEach(esc => {
      if (esc.stato === 'PROGRAMMATA' && esc.dataOrario) {
        const dataEsc = new Date(esc.dataOrario);
        if (dataEsc < adesso) {
          esc.stato = 'COMPLETATA';
          haSubitoCambiamenti = true;
        }
      }
    });
    if (haSubitoCambiamenti) {
      this.cdr.detectChanges();
    }
  }

  // Metodo di creazione di un Feedback
  inviaFeedback(): void {
    const datiUtente = this.getDatiUtenteDalToken();
    if (!datiUtente) {
      alert('Errore: Devi fare il login per inserire un feedback!');
      return;
    }

    if (!this.commentoNuovoFeedback || !this.commentoNuovoFeedback.trim()) {
      this.erroreFeedback = 'Il commento non può essere vuoto.';
      return;
    }

    const payload = {
      valutazione: this.valutazioneNuovoFeedback,
      commento: this.commentoNuovoFeedback
    };

    this.parcoService.scriviFeedback(this.escursioneSelezionataFeedback.id, datiUtente.id, payload).subscribe({
      next: (nuovoFb) => {
        alert('Feedback inserito con successo!');

        this.parcoService.getEscursioni().subscribe({
          next: (dati) => {
            this.escursioniList = dati;
            this.checkEscursioniScadute();
            const updatedEsc = dati.find(e => e.id === this.escursioneSelezionataFeedback.id);
            if (updatedEsc) {
              this.escursioneSelezionataFeedback = updatedEsc;
            }
            this.cdr.detectChanges();
          },
          error: (err) => console.error('Errore nel ricaricare le escursioni:', err)
        });

        this.commentoNuovoFeedback = '';
        this.valutazioneNuovoFeedback = 5;
        this.erroreFeedback = '';
      },
      error: (err) => {
        console.error('Errore durante l\'invio del feedback:', err);
        this.erroreFeedback = err.error?.message || 'Impossibile inviare il feedback.';
        this.cdr.detectChanges();
      }
    });
  }

  puoAnnullare(esc: any): boolean {
    const dati = this.getDatiUtenteDalToken();
    if (!dati) return false;
    if (dati.role === 'ADMIN') return true;
    if (dati.role === 'GUIDA') {
      return esc.guidaId === dati.id;
    }
    return false;
  }

  annullaEscursione(escursioneId: number): void {
    if (confirm('Sei sicuro di voler annullare questa escursione? Tutti i clienti prenotati verranno rimborsati e notificati via email.')) {
      this.parcoService.annullaEscursione(escursioneId).subscribe({
        next: (risposta) => {
          alert('Escursione annullata con successo. I clienti sono stati rimborsati e avvisati via email.');
          this.caricaDatiDalDatabase();
        },
        error: (err) => {
          console.error("Errore durante l'annullamento dell'escursione:", err);
          alert(err.error?.message || "Impossibile annullare l'escursione.");
        }
      });
    }
  }
}