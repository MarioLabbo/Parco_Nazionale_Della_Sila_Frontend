import { Component } from '@angular/core';
import { AuthService } from '../auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  standalone: false // Evita che Angular legga il component come Standalone
})
export class LoginComponent {

  username = '';
  password = '';
  ricordami = false;
  erroreLogin = '';

  constructor(private authService: AuthService, private router: Router) {}

  // Metodo per verificare il successo del Login
  onLogin() {
    const credenziali = {
      username: this.username,
      password: this.password
    };

    this.authService.login(credenziali).subscribe({
      next: (response: any) => {
        this.authService.salvaToken(response.token, response.ruolo);
        console.log('Login effettuato con successo! Ruolo:', response.ruolo);
        this.router.navigate(['/']);
      },
      error: (err: any) => {
        this.erroreLogin = 'Username o password errati. Riprova.';
        console.error('Errore durante il login:', err);
      }
    });
  }
}
