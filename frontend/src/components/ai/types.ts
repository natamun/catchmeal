/** One bubble of the assistant chat. */
export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

/** The assistant's answer to POST /users/:id/chat. */
export type ResponseMistral = {
  message: string;
  conversationId: string;
};
