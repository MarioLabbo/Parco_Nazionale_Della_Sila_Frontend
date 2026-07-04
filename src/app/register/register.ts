import { Component } from '@angular/core';
import { AuthService } from '../auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
  standalone: false
})
export class RegisterComponent {

  nuovoUtente = {
    username: '',
    email: '',
    password: '',
    ruolo: 'TURISTA' // Assegniamo automaticamente il ruolo di base
  };

  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.register(this.nuovoUtente).subscribe({
      next: (response: any) => {
        this.successMessage = 'Registrazione completata con successo! Ora puoi accedere.';
        this.errorMessage = '';

        // Aspetta 2 secondi per far leggere il messaggio
        setTimeout(() => {
           console.log("Utente registrato, pronto per il login!");
        }, 2000);
      },
      error: (err: any) => {
        this.errorMessage = 'Errore durante la registrazione. Username o email forse già esistenti?';
        this.successMessage = '';
        console.error('Errore registrazione:', err);
      }
    });
  }
}
