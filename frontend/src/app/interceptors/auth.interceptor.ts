import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { LoggerService } from '../services/logger.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private auth: AuthService,
    private logger: LoggerService
  ) {}

  /**
   * Intercepta todas as requisições HTTP
   * Adiciona o token de autenticação e withCredentials quando necessário
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getAccessToken();
    let authReq = req;

    // Adiciona o token de autenticação se disponível
    if (token) {
      authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
    } else {
      // Mesmo sem token, adiciona withCredentials para requisições de auth
      authReq = req.clone({ withCredentials: true });
    }

    return next.handle(authReq).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401(authReq, next);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Trata erros 401 (não autorizado)
   * Tenta renovar o token usando o refresh token
   */
  private handle401(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Evita tentar refresh em rotas de autenticação
    if (req.url.includes('/login') || req.url.includes('/register')) {
      return throwError(() => new HttpErrorResponse({ status: 401 }));
    }

    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      this.logger.log('Token expirado, tentando renovar...');

      return this.auth.refreshToken().pipe(
        switchMap((res) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(res.accessToken);
          this.logger.log('Token renovado, reenviando requisição');

          // Reenvia a requisição original com o novo token
          return next.handle(
            req.clone({
              setHeaders: { Authorization: `Bearer ${res.accessToken}` },
              withCredentials: true,
            })
          );
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.logger.error('Falha ao renovar token, fazendo logout');

          // Faz logout e redireciona para login
          this.auth.logout().subscribe();

          return throwError(() => err);
        })
      );
    } else {
      // Se já está renovando, aguarda o resultado
      return this.refreshTokenSubject.pipe(
        filter((token) => token != null),
        take(1),
        switchMap((token) =>
          next.handle(
            req.clone({
              setHeaders: { Authorization: `Bearer ${token}` },
              withCredentials: true,
            })
          )
        )
      );
    }
  }
}
