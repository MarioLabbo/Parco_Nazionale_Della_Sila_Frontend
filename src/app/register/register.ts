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

  nome = '';
  email = '';
  password = '';
  confermaPassword = '';
  erroreRegister = '';

  constructor(private authService: AuthService, private router: Router) {}

  onRegister() {
    if (this.password !== this.confermaPassword) {
      this.erroreRegister = 'Le password non coincidono.';
      return;
    }

    const nuovoUtente = {
      username: this.nome, // using name as username
      email: this.email,
      password: this.password,
      ruolo: 'TURISTA'
    };

    this.authService.register(nuovoUtente).subscribe({
      next: (response: any) => {
        console.log('Registrazione completata con successo! Reindirizzamento al login...');
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.erroreRegister = 'Errore durante la registrazione. Email forse già esistente?';
        console.error('Errore registrazione:', err);
      }
    });
  }
}
