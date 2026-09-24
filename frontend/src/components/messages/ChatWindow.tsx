import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from 'react';
import { Send } from 'lucide-react';

import { useAuth } from '../../auth/auth-context';
import { useConversation } from '../../hooks/useConversation';
import type { UserSummary } from '../friends/types';
import { BaseDialog } from '../ui/BaseDialog';
import { Input } from '../ui/Input';
import { ApiError, sendMessage } from './api';

interface ChatWindowProps {
  dialogRef: RefObject<HTMLDialogElement | null>;
  friend: UserSummary;
}

export default function ChatWindow({ dialogRef, friend }: ChatWindowProps) {
  const { user } = useAuth();
  const userId = user!.userId;
  const { messages, isLoading, loadError, addMessage } = useConversation(
    userId,
    friend.id,
  );
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight });
  }, [messages]);

  const handleSend = async (event: FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;

    setIsSending(true);
    setSendError(null);
    try {
      const message = await sendMessage(userId, friend.id, content);
      addMessage(message);
      setDraft('');
    } catch (err) {
      console.error(err);
      setSendError(
        err instanceof ApiError ? err.message : 'Message non envoyé, réessaye.',
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <BaseDialog dialogRef={dialogRef} title={friend.name}>
      <div className="flex h-[480px] flex-col">
        {isLoading && (
          <p className="p-4 text-sm text-green-400">Chargement...</p>
        )}
        {loadError && <p className="p-4 text-sm text-red-500">{loadError}</p>}

        <div
          ref={threadRef}
          className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.senderId === userId ? 'justify-end' : ''}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                  m.senderId === userId
                    ? 'rounded-br-sm bg-green-500 text-white'
                    : 'rounded-bl-sm border border-green-200 bg-white text-green-800'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
        </div>

        {sendError && (
          <p className="px-4 pb-2 text-xs text-red-500">{sendError}</p>
        )}

        <form
          onSubmit={(e) => void handleSend(e)}
          className="flex shrink-0 items-center gap-2 border-t border-green-100 p-3"
        >
          <Input
            type="text"
            placeholder="Écrire un message..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={isSending || !draft.trim()}
            aria-label="Envoyer"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-green-500 text-white transition-colors hover:bg-green-600 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </BaseDialog>
  );
}
