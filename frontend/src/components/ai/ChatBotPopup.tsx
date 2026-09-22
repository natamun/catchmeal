import { useEffect, useRef, useState } from 'react';
import { Bot, Forward, Loader } from 'lucide-react';

import { CURRENT_USER_ID } from '../../constants/currentUser';
import type { ChatMessage } from '../../types/ChatBotType';

type ResponseMistral = {
  message: string;
  conversationId: string;
};

interface ChatBotPopupProps {
  isOpen: boolean;
  onToggle: (v: boolean) => void;
  messages: ChatMessage[];
  onMessagesChange: (message: ChatMessage[]) => void;
  conversationId: string | null;
  onConversationIdChange: (id: string) => void;
}

export default function ChatBotPopup({
  isOpen,
  onToggle,
  messages,
  onMessagesChange,
  conversationId,
  onConversationIdChange,
}: ChatBotPopupProps) {
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      console.log(data);
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
        <div className="fixed right-5 bottom-25 h-120 w-70 rounded-2xl border border-green-300 bg-white">
          <div className="flex min-h-10 justify-between rounded-t-2xl bg-green-400">
            <p className="m-1.5 text-xl font-semibold text-white">
              Chat Assistant
            </p>
            <button
              className="m-1.5 flex h-3 w-3 justify-end rounded-full font-semibold text-white hover:bg-emerald-400/80"
              onClick={() => onToggle(false)}
            >
              X
            </button>
          </div>
          <div className="h-97 overflow-auto">
            {messages.map((msg) => (
              <div
                className={`m-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} `}
              >
                <p
                  className={`max-w-[75%] rounded-2xl px-3 py-2 ${msg.role === 'user' ? 'bg-green-500 text-white' : 'bg-gray-200 text-black'}`}
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
              className="ml-2 min-w-0 flex-1 p-2 outline-none focus:outline-none"
              value={input}

              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSend();
                }
              }}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écrivez un message..."
            />
            {/* <div className="min-w-3 min-h-3"> {loading === true && <Loader />} </div> */}
            <div className="m-2 flex min-h-5 min-w-5 shrink-0">
              {loading === false && (
                <button className="shrink-0" onClick={handleSend}>
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
