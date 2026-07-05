import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

// Usato per evitare chiamate dirette tra Angular e DB
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Prendiamo il token dalle tasche del browser
    const token = localStorage.getItem('jwt_token');

    // Se il token esiste cloniamo la richiesta originale e le agganciamo l'header di sicurezza
    if (token) {
      const clonedReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });

      // Passiamo la richiesta modificata al prossimo anello della catena
      return next.handle(clonedReq);
    }

    // Se non c'è nessun token la richiesta parte normale
    return next.handle(req);
  }
}
