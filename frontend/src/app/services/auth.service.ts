import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { LoginResponse, Usuario, RegisterPayload } from '../models/usuario.model';
import { LoggerService } from './logger.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.authUrl;
  private accessToken: string | null = null;
  private userSubject = new BehaviorSubject<Usuario | null>(null);
  private isInitialized = false;

  user$: Observable<Usuario | null> = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private logger: LoggerService
  ) {
    this.initializeAuth();
  }

  /**
   * Inicializa a autenticação tentando recuperar a sessão
   */
  private initializeAuth(): void {
    if (this.isInitialized) {
      return;
    }

    this.isInitialized = true;

    // Tenta recuperar a sessão usando o refresh token
    this.refreshToken().subscribe({
      next: () => {
        this.logger.log('Sessão recuperada com sucesso');
      },
      error: () => {
        this.logger.log('Nenhuma sessão válida encontrada');
      },
    });
  }

  /**
   * Registra um novo usuário
   */
  register(payload: RegisterPayload): Observable<void> {
    return this.http.post<void>(`${this.api}/register`, payload, {
      withCredentials: true,
    });
  }

  /**
   * Realiza o login e salva o token em memória
   */
  login(email: string, senha: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.api}/login`, { email, senha }, { withCredentials: true })
      .pipe(
        tap((res) => {
          this.accessToken = res.accessToken;
          this.userSubject.next(res.usuario);
          this.logger.log('Login bem-sucedido', { usuario: res.usuario.email });
        }),
        catchError((error) => {
          this.logger.error('Erro ao fazer login', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Faz a renovação do token expirado usando o refresh token
   */
  refreshToken(): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.api}/refresh`, {}, { withCredentials: true })
      .pipe(
        tap((res) => {
          this.accessToken = res.accessToken;
          this.userSubject.next(res.usuario);
          this.logger.log('Token renovado com sucesso');
        }),
        catchError((err) => {
          this.logger.warn('Falha ao renovar token', err);
          this.clearAuthState();
          return throwError(() => err);
        })
      );
  }

  /**
   * Realiza o logout no servidor e limpa o estado local
   */
  logout(): Observable<void> {
    return this.http.post<void>(`${this.api}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.clearAuthState();
        this.router.navigate(['/login']);
        this.logger.log('Logout realizado com sucesso');
      }),
      catchError((error) => {
        // Mesmo com erro, limpa o estado local
        this.clearAuthState();
        this.router.navigate(['/login']);
        this.logger.error('Erro ao fazer logout', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Limpa o estado de autenticação
   */
  private clearAuthState(): void {
    this.accessToken = null;
    this.userSubject.next(null);
  }

  /**
   * Retorna o token de acesso atual
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  /**
   * Retorna o usuário atual
   */
  getCurrentUser(): Usuario | null {
    return this.userSubject.value;
  }
}
