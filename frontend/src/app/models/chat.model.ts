export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp?: Date;
}

export interface GeminiResponse {
  response: string;
  conversationId?: string;
}
