export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp?: Date;
}

export interface GeminiResponse {
  reply: string;
  conversationId?: string;
}

export interface GeminiRequest {
  prompt: string;
  conversationId?: string;
}
