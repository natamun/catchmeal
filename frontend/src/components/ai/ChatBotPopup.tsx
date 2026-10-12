import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Bot, LoaderCircle, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { useAuth } from '../../auth/auth-context';
import type { ChatMessage, ResponseMistral } from '../../types/ChatBotType';
import { requestErrorMessage } from '../../utils/requestErrorMessage';
import type { Tab } from '../layout/Nav';
import DisclamerPopup from './DisclamerPopup';

class ChatError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`HTTP ${status}`);
    this.status = status;
  }
}

interface ChatBotPopupProps {
  isOpen: boolean;
  onToggle: (v: boolean) => void;
  messages: ChatMessage[];
  onMessagesChange: (message: ChatMessage[]) => void;
  activePage: Tab;
}

export default function ChatBotPopup({
  isOpen,
  onToggle,
  messages,
  onMessagesChange,
  activePage,
}: ChatBotPopupProps) {
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastAssistantRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [disclamer, setDisclamer] = useState<boolean>(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const { user } = useAuth();
  const CURRENT_USER_ID = user?.userId;
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [isOpen]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant') {
      lastAssistantRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    onToggle(false);
  }, [activePage, onToggle]);

  async function handleSend() {
    if (!input.trim() || loading) return;
    const addMessage: ChatMessage = { role: 'user', content: input };
    const updateWithUser = [...messages, addMessage];
    onMessagesChange(updateWithUser);
    setLoading(true);
    setSendError(null);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    try {
      if (!CURRENT_USER_ID) {
        throw new Error('UID is not defined');
      }
      const response = await fetch(`${API_URL}/users/${CURRENT_USER_ID}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: addMessage.content,
        }),
      });
      if (!response.ok) {
        throw new ChatError(response.status);
      }
      const data = (await response.json()) as ResponseMistral;
      if (data) {
        const addResponse: ChatMessage = {
          role: 'assistant',
          content: data.message,
        };

        onMessagesChange([...updateWithUser, addResponse]);
      }
    } catch (err) {
      onMessagesChange(messages);
      setInput(addMessage.content);
      setSendError(
        requestErrorMessage(err, "L'assistant est indisponible, réessayez.", {
          400: "Ce message n'est pas valide.",
        }),
      );
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  }

  return (
    <div className="fixed right-6 bottom-6 z-20 pointer-coarse:bottom-[calc(5rem+env(safe-area-inset-bottom))]">
      {isOpen && (
        <div
          role="dialog"
          aria-label="Assistant CatCHMeal"
          className="relative flex h-[32rem] max-h-[calc(100dvh-8rem-env(safe-area-inset-bottom))] w-[min(24rem,calc(100vw-3rem))] animate-fade-in-up flex-col overflow-hidden rounded-2xl border border-green-200 bg-white shadow-lg"
        >
          {disclamer && (
            <div className="absolute inset-0 z-10 flex items-center bg-black/30 p-4 backdrop-blur-sm">
              <DisclamerPopup setDisclamer={setDisclamer} />
            </div>
          )}
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <h2 className="text-lg font-bold text-green-800">
              Assistant CatCHMeal
            </h2>
            <button
              type="button"
              onClick={() => onToggle(false)}
              aria-label="Fermer"
              className="cursor-pointer text-green-400 transition-colors hover:text-green-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 pb-3">
            {messages.map((msg, key) => (
              <div
                key={key}
                ref={
                  key === messages.length - 1 && msg.role === 'assistant'
                    ? lastAssistantRef
                    : null
                }
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm wrap-break-word ${msg.role === 'user' ? 'bg-green-500 text-white' : 'bg-green-50 text-green-800'}`}
                >
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          {sendError && (
            <p role="alert" className="mx-4 mb-2 text-sm text-red-500">
              {sendError}
            </p>
          )}
          <div className="mx-4 flex items-end gap-2 rounded-xl border border-green-200 px-3 py-2 focus-within:border-green-400">
            <textarea
              className="max-h-20 min-w-0 flex-1 resize-none self-center overflow-y-auto text-sm text-green-800 outline-none"
              value={input}
              maxLength={250}
              disabled={disclamer}
              minLength={1}
              rows={1}
              ref={textareaRef}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && loading === false) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
              onChange={handleInputChange}
              placeholder="Écrivez un message..."
            />
            <div className="flex shrink-0 flex-col items-center gap-1">
              {input.length > 200 && (
                <span
                  className={`text-xs ${input.length >= 250 ? 'text-red-500' : 'text-green-500'}`}
                >
                  {input.length}/250
                </span>
              )}
              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={loading}
                aria-label="Envoyer"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-green-500 text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <p className="px-4 pt-2 pb-3 text-center text-xs text-green-500">
            Par votre utilisation du chat, vous acceptez cette{' '}
            <button
              type="button"
              onClick={() => setDisclamer(true)}
              className="cursor-pointer font-medium text-green-600 underline underline-offset-2 transition-colors hover:text-green-800"
            >
              clause de non-responsabilité
            </button>
            .
          </p>
        </div>
      )}
      {!isOpen && (
        <button
          type="button"
          onClick={() => onToggle(true)}
          aria-label="Ouvrir l'assistant"
          className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-green-500 text-white shadow-lg ring-2 ring-white transition-colors hover:bg-green-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-400"
        >
          <Bot className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
