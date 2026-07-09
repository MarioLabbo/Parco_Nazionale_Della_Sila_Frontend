import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ParcoService } from '../parco';
import { AuthService } from '../auth';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  standalone: false
})
export class NavbarComponent {

  usernameDaPromuovere = '';

  constructor(private router: Router, private parcoService: ParcoService, private authService: AuthService ) {}

  // Controlla se il token esiste
   isLoggedIn(): boolean {
      return this.authService.isLogged();
    }

  // Recupera il ruolo salvato per eventuali messaggi personalizzati
  getRuolo(): string | null {
    return this.authService.getRuolo();
  }

  // Funzione di Logout: svuota le tasche del browser e rispedisce al login
   logout() {
      this.authService.logout();
      console.log('Sessione terminata. Arrivederci!');
      this.router.navigate(['/login']);
    }

  // Avvia il flusso per cercare un utente e promuoverlo a GUIDA (riservato agli amministratori)
  promuoviUtente(): void {
    if (!this.usernameDaPromuovere) return;

    this.parcoService.cercaUtentePerUsername(this.usernameDaPromuovere).subscribe({
      next: (utente) => {
        if (utente && utente.id) {
          if (confirm(`Sei sicuro di voler promuovere l'utente ${utente.username} (ID: ${utente.id}) a GUIDA?`)) {
            this.parcoService.promuoviAGuida(utente.id).subscribe({
              next: () => {
                alert(`L'utente ${utente.username} è stato promosso a GUIDA con successo!`);
                this.usernameDaPromuovere = '';
              },
              error: (err) => {
                console.error("Errore promozione:", err);
                alert("Errore durante la promozione dell'utente: " + (err.error?.message || err.message));
              }
            });
          }
        } else {
          alert("Utente non trovato o dati non validi.");
        }
      },
      error: (err) => {
        console.error("Errore ricerca utente:", err);
        alert("Impossibile trovare l'utente con lo username: " + this.usernameDaPromuovere);
      }
    });
  }
}
