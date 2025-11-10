import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { GeminiResponse, GeminiRequest } from '../models/chat.model';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private backendUrl = environment.geminiUrl;

  constructor(
    private http: HttpClient,
    private logger: LoggerService
  ) {}

  /**
   * Envia uma mensagem para o chatbot e retorna a resposta
   * @param prompt - A mensagem do usuário
   * @param conversationId - ID da conversa para manter contexto
   * @returns Promise com a resposta do bot e o ID da conversa
   */
  async sendMessage(prompt: string, conversationId?: string): Promise<GeminiResponse> {
    try {
      // Inclui o conversationId na requisição se disponível
      const url = conversationId
        ? `${this.backendUrl}?conversationId=${conversationId}`
        : this.backendUrl;

      const body: GeminiRequest = { prompt, conversationId };

      this.logger.log('Enviando mensagem para Gemini', { conversationId });

      const response = await lastValueFrom(this.http.post<GeminiResponse>(url, body));

      this.logger.log('Resposta recebida do Gemini');

      return {
        reply: response.reply || 'Sem resposta.',
        conversationId: response.conversationId,
      };
    } catch (error) {
      this.logger.error('Erro ao enviar mensagem para o backend', error);
      return {
        reply: 'Erro ao se conectar com o servidor. Tente novamente.',
        conversationId,
      };
    }
  }
}
