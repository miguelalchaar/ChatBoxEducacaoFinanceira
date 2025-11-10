import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GeminiService } from '../../services/gemini.service';
import { LoggerService } from '../../services/logger.service';
import { MainNavbar } from '../main-navbar/main-navbar';
import { ChatMessage } from '../../models/chat.model';

@Component({
  selector: 'app-chat-widget',
  imports: [FormsModule, CommonModule, MainNavbar],
  templateUrl: './chat-widget.html',
  styleUrl: './chat-widget.css',
})
export class ChatWidget {
  isOpen = false;
  userInput = '';
  messages: ChatMessage[] = [];
  conversationId?: string;
  isSending = false;

  // Rate limiting: máximo de mensagens por minuto
  private readonly MAX_MESSAGES_PER_MINUTE = 10;
  private readonly RATE_LIMIT_WINDOW = 60000; // 1 minuto em ms
  private messageTimes: number[] = [];

  constructor(
    private geminiService: GeminiService,
    private logger: LoggerService
  ) {}

  toggleChat(): void {
    this.isOpen = !this.isOpen;
  }

  /**
   * Verifica se o usuário atingiu o limite de mensagens
   */
  private isRateLimited(): boolean {
    const now = Date.now();

    // Remove timestamps antigos (fora da janela de tempo)
    this.messageTimes = this.messageTimes.filter(
      (time) => now - time < this.RATE_LIMIT_WINDOW
    );

    return this.messageTimes.length >= this.MAX_MESSAGES_PER_MINUTE;
  }

  /**
   * Registra o tempo de envio de uma mensagem
   */
  private recordMessageTime(): void {
    this.messageTimes.push(Date.now());
  }

  async sendMessage(): Promise<void> {
    const text = this.userInput.trim();

    if (!text || this.isSending) {
      return;
    }

    // Verifica rate limiting
    if (this.isRateLimited()) {
      this.messages.push({
        sender: 'bot',
        text: 'Você atingiu o limite de mensagens por minuto. Aguarde um momento.',
      });
      this.logger.warn('Rate limit atingido');
      return;
    }

    this.isSending = true;
    this.recordMessageTime();

    // Adiciona mensagem do usuário
    this.messages.push({ sender: 'user', text, timestamp: new Date() });
    this.userInput = '';

    // Adiciona mensagem de "digitando..."
    this.messages.push({ sender: 'bot', text: 'Digitando...', timestamp: new Date() });

    try {
      const result = await this.geminiService.sendMessage(text, this.conversationId);

      // Atualiza conversationId se o backend devolver um novo
      if (result.conversationId) {
        this.conversationId = result.conversationId;
        this.logger.log('Conversation ID atualizado', { conversationId: this.conversationId });
      }

      // Atualiza a última mensagem do bot com a resposta real
      this.messages[this.messages.length - 1] = {
        sender: 'bot',
        text: result.reply,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Erro ao enviar mensagem', error);
      this.messages[this.messages.length - 1] = {
        sender: 'bot',
        text: 'Erro ao se conectar com o servidor.',
        timestamp: new Date(),
      };
    } finally {
      this.isSending = false;
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  sendSuggestion(text: string): void {
    this.userInput = text;
    this.sendMessage();
  }
}
