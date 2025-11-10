import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../models/usuario.model';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  constructor(private logger: LoggerService) {}

  /**
   * Processa erros HTTP e retorna mensagem amigável ao usuário
   */
  handleError(error: HttpErrorResponse): string {
    this.logger.error('Erro HTTP:', error);

    // Erro do lado do cliente (rede, etc)
    if (error.error instanceof ErrorEvent) {
      return 'Erro de conexão. Verifique sua internet e tente novamente.';
    }

    // Erro do lado do servidor
    const apiError = error.error as ApiError;

    // Mensagens específicas por status code
    switch (error.status) {
      case 400:
        return apiError?.message || 'Dados inválidos. Verifique as informações.';
      case 401:
        return apiError?.message || 'Credenciais inválidas. Verifique e tente novamente.';
      case 403:
        return 'Acesso negado. Você não tem permissão para esta ação.';
      case 404:
        return 'Recurso não encontrado.';
      case 409:
        return apiError?.message || 'Conflito de dados. Este registro já existe.';
      case 422:
        return apiError?.message || 'Dados inválidos. Verifique as informações.';
      case 429:
        return 'Muitas requisições. Aguarde alguns instantes e tente novamente.';
      case 500:
        return 'Erro interno do servidor. Tente novamente mais tarde.';
      case 503:
        return 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.';
      default:
        return apiError?.message || 'Erro inesperado. Tente novamente.';
    }
  }

  /**
   * Retorna mensagem específica para erros de autenticação
   */
  handleAuthError(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return 'E-mail ou senha inválidos.';
    }
    if (error.status === 409) {
      return 'Este e-mail ou CNPJ já está cadastrado.';
    }
    return this.handleError(error);
  }
}
