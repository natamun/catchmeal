import { useEffect, useRef, useState } from 'react';
import { Bot, Forward, Loader } from 'lucide-react';

import { CURRENT_USER_ID } from '../../constants/currentUser';
import type { ChatMessage, ResponseMistral } from '../../types/ChatBotType';
import type { Tab } from '../layout/Nav';

interface ChatBotPopupProps {
  isOpen: boolean;
  onToggle: (v: boolean) => void;
  messages: ChatMessage[];
  onMessagesChange: (message: ChatMessage[]) => void;
  conversationId: string | null;
  onConversationIdChange: (id: string) => void;
  activePage: Tab;
}

export default function ChatBotPopup({
  isOpen,
  onToggle,
  messages,
  onMessagesChange,
  conversationId,
  onConversationIdChange,
  activePage,
}: ChatBotPopupProps) {
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    onToggle(false);
  }, [activePage, onToggle]);

  async function handleSend() {
    if (!input) return;
    const addMessage: ChatMessage = { role: 'user', content: input };
    const updateWithUser = [...messages, addMessage];
    onMessagesChange(updateWithUser);
    setLoading(true);
    setInput('');
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users/${CURRENT_USER_ID}/chat`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: addMessage.content,
            conversationId: conversationId,
          }),
        },
      );
      const data: ResponseMistral = await response.json();
      if (data) {
        onConversationIdChange(data.conversationId);

        const addResponse: ChatMessage = {
          role: 'assistant',
          content: data.message,
        };

        onMessagesChange([...updateWithUser, addResponse]);
      }
    } catch (err) {
      console.error('Error : ', err);
      setError('Error during fetch data to backend, try later');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="">
      {isOpen === false && (
        <button
          className="fixed right-1 bottom-20 h-14 w-14 rounded-full bg-green-500 text-sm font-semibold text-white ring-1 ring-green-500 hover:bg-emerald-400/80"
          onClick={() => onToggle(true)}
        >
          <Bot height={30} width={30} className="ml-3.5" />
        </button>
      )}
      {isOpen === true && (
        <div className="fixed right-5 bottom-25 ml-5 h-120 max-w-100 rounded-2xl border border-green-300 bg-white md:bottom-5">
          <div className="flex justify-between rounded-t-2xl bg-green-400">
            <p className="m-1.5 text-xl font-semibold text-white">
              Chat Assistant
            </p>
            <button
              className="m-1.5 flex h-3 w-3 justify-end font-semibold text-white hover:text-gray-200"
              onClick={() => onToggle(false)}
            >
              X
            </button>
          </div>
          <div className="h-97 overflow-auto">
            {messages.map((msg, key) => (
              <div
                key={key}
                className={`m-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} `}
              >
                <p
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${msg.role === 'user' ? 'bg-green-500 text-white' : 'bg-gray-200 text-black'}`}
                >
                  {' '}
                  {msg.content}
                </p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="m-1 flex h-10 rounded-2xl bg-green-50">
            <input
              className="ml-2 flex-1 outline-none focus:outline-none"
              value={input}

              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  void handleSend();
                }
              }}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écrivez un message..."
            />
            <div className="m-2 flex min-h-5 min-w-5 shrink-0">
              {loading === false && (
                <button className="shrink-0 rounded-3xl hover:bg-green-100/80" onClick={() => void handleSend}>
                  <Forward />
                </button>
              )}
              {loading === true && <Loader height={20} width={20} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
