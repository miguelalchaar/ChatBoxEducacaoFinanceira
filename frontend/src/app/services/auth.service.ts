import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { LoginResponse, Usuario, RegisterPayload } from '../models/usuario.model';
import { LoggerService } from './logger.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.authUrl;
  private accessToken: string | null = null;
  private refreshTokenValue: string | null = null;
  private userSubject = new BehaviorSubject<Usuario | null>(null);
  private isInitialized = false;
  private readonly storageKeys = {
    accessToken: 'oriento.accessToken',
    refreshToken: 'oriento.refreshToken',
    user: 'oriento.usuario',
  };

  user$: Observable<Usuario | null> = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private logger: LoggerService
  ) {
    this.loadStoredSession();
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

    if (!this.refreshTokenValue) {
      this.logger.log('Nenhum refresh token armazenado. Usuário não autenticado.');
      return;
    }

    this.refreshToken().subscribe({
      next: () => {
        this.logger.log('Sessão recuperada com sucesso');
      },
      error: (error) => {
        this.logger.warn('Não foi possível recuperar a sessão automaticamente', error);
      },
    });
  }

  private loadStoredSession(): void {
    const storedAccessToken = localStorage.getItem(this.storageKeys.accessToken);
    const storedRefreshToken = localStorage.getItem(this.storageKeys.refreshToken);
    const storedUser = localStorage.getItem(this.storageKeys.user);

    this.accessToken = storedAccessToken;
    this.refreshTokenValue = storedRefreshToken;

    if (storedUser) {
      try {
        const usuario: Usuario = JSON.parse(storedUser);
        this.userSubject.next(usuario);
      } catch (error) {
        this.logger.warn('Não foi possível restaurar os dados do usuário armazenado', error);
        localStorage.removeItem(this.storageKeys.user);
      }
    }
  }

  private handleAuthSuccess(res: LoginResponse): void {
    this.accessToken = res.accessToken;
    this.refreshTokenValue = res.refreshToken;
    this.userSubject.next(res.usuario);
    this.persistSession(res);
  }

  private persistSession(res: LoginResponse): void {
    localStorage.setItem(this.storageKeys.accessToken, res.accessToken);
    localStorage.setItem(this.storageKeys.refreshToken, res.refreshToken);
    localStorage.setItem(this.storageKeys.user, JSON.stringify(res.usuario));
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
          this.handleAuthSuccess(res);
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
    if (!this.refreshTokenValue) {
      return throwError(() => new Error('Refresh token indisponível.'));
    }

    return this.http
      .post<LoginResponse>(
        `${this.api}/refresh`,
        { refreshToken: this.refreshTokenValue },
        { withCredentials: true }
      )
      .pipe(
        tap((res) => {
          this.handleAuthSuccess(res);
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
    const performLogout$ = this.refreshTokenValue
      ? this.http.post<void>(
          `${this.api}/logout`,
          { refreshToken: this.refreshTokenValue },
          { withCredentials: true }
        )
      : of(void 0);

    return performLogout$.pipe(
      tap(() => {
        this.logger.log('Logout realizado com sucesso');
      }),
      catchError((error) => {
        this.logger.error('Erro ao fazer logout', error);
        return of(void 0);
      }),
      finalize(() => {
        this.clearAuthState();
        this.router.navigate(['/login']);
      })
    );
  }

  /**
   * Limpa o estado de autenticação
   */
  private clearAuthState(): void {
    this.accessToken = null;
    this.refreshTokenValue = null;
    this.userSubject.next(null);
    localStorage.removeItem(this.storageKeys.accessToken);
    localStorage.removeItem(this.storageKeys.refreshToken);
    localStorage.removeItem(this.storageKeys.user);
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
