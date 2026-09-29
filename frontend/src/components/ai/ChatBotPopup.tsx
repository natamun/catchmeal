import { useEffect, useRef, useState } from 'react';
import { Bot, Forward, Loader, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { CURRENT_USER_ID } from '../../constants/currentUser';
import type { ChatMessage, ResponseMistral } from '../../types/ChatBotType';
import type { Tab } from '../layout/Nav';

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
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users/${CURRENT_USER_ID}/chat`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: addMessage.content,
          }),
        },
      );
      const data = (await response.json()) as ResponseMistral;
      if (data) {
        const addResponse: ChatMessage = {
          role: 'assistant',
          content: data.message,
        };

        onMessagesChange([...updateWithUser, addResponse]);
      }
    } catch (err) {
      console.error('Error : ', err);
      setInput('');
      setLoading(false);
      onToggle(false);
      onMessagesChange([]);
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
    <div>
      {isOpen === false && (
        <button
          className="fixed right-3 bottom-20 h-14 w-14 rounded-full bg-green-500 text-sm font-semibold text-white ring-1 ring-green-500 hover:bg-emerald-400/80"
          onClick={() => onToggle(true)}
        >
          <Bot height={30} width={30} className="ml-3.5" />
        </button>
      )}
      {isOpen === true && (
        <div className="fixed right-2 bottom-25 flex h-121 w-75 flex-col rounded-2xl border border-green-400 bg-white shadow-xl sm:right-5 sm:w-100 md:bottom-10">
          <div className="flex justify-between rounded-t-2xl bg-green-400 shadow-sm">
            <p className="m-1.5 text-xl font-semibold text-white">
              Chat Assistant
            </p>
            <button
              className="m-3 flex justify-end font-semibold text-white hover:text-gray-200"
              onClick={() => onToggle(false)}
            >
              <X height={20} width={20} />
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            {messages.map((msg, key) => (
              <div
                key={key}
                ref={
                  key === messages.length - 1 && msg.role === 'assistant'
                    ? lastAssistantRef
                    : null
                }
                className={`m-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} `}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm wrap-break-word ${msg.role === 'user' ? 'bg-green-400 text-white' : 'border border-green-50 bg-gray-100 text-black'}`}
                >
                  {' '}
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="m-1 flex shrink-0 items-end rounded-2xl bg-green-50">
            <textarea
              className="m-2 max-h-20 min-w-0 flex-1 resize-none overflow-y-auto outline-none focus:outline-none"
              value={input}
              maxLength={250}
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
            <div className="m-2 flex min-h-5 min-w-5 shrink-0 flex-col">
              {input.length > 200 && (
                <span
                  className={`self-center text-[9px] ${input.length >= 250 ? 'text-red-500' : 'text-gray-400'}`}
                >
                  {input.length}/250
                </span>
              )}
              {loading === false && (
                <button
                  className="shrink-0 rounded-3xl hover:bg-green-100/80"
                  onClick={() => void handleSend()}
                >
                  <Forward />
                </button>
              )}
              {loading === true && (
                <Loader height={20} width={20} className="animate-spin" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
