export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type ResponseMistral = {
  message: string;
  conversationId: string;
};
