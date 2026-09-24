import { useEffect, useState, type RefObject } from 'react';

import { BaseDialog } from '../ui/BaseDialog';
import { Input } from '../ui/Input';
import { ApiError, searchUsers, sendFriendRequest } from './api';
import type { UserSummary } from './types';
import * as Popover from '@radix-ui/react-popover';
import { DropdownPanel } from '../ui/DropdownPanel';

const MIN_QUERY_LENGTH = 2;
const SEARCH_DELAYS_MS = 300;

interface AddFriendDialogProps {
  dialogRef: RefObject<HTMLDialogElement | null>;
  userId: number;
  friendIds: number[];
  onSent: (username: string) => void;
}

export default function AddFriendDialog({
  dialogRef,
  userId,
  friendIds,
  onSent,
}: AddFriendDialogProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sentIds, setSentIds] = useState<Set<number>>(new Set());
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [dialogNode, setDialogNode] = useState<HTMLDialogElement | null>(null);

  const trimmed = query.trim();
  const canSearch = trimmed.length >= MIN_QUERY_LENGTH;

  useEffect(() => {
    if (!canSearch) {
      return;
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      setIsSearching(true);
      searchUsers(trimmed, controller.signal)
        .then((users) => {
          setResults(users);
          setError(null);
        })
        .catch((err: unknown) => {
          if (controller.signal.aborted) {
            return;
          }
          console.error(err);
          setError('Recherche impossible, réessaye.');
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setIsSearching(false);
          }
        });
    }, SEARCH_DELAYS_MS);
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [canSearch, trimmed]);

  const reset = () => {
    setQuery('');
    setResults([]);
    setIsSearching(false);
    setSentIds(new Set());
    setPendingId(null);
    setError(null);
  };

  const handleSend = async (user: UserSummary) => {
    setError(null);
    setPendingId(user.id);
    try {
      await sendFriendRequest(userId, user.id);
      setSentIds((prev) => new Set(prev).add(user.id));
      onSent(user.username);
    } catch (err: unknown) {
      console.error(err);
      setError(
        err instanceof ApiError
          ? err.message
          : 'Une erreur est survenue, réessaye.',
      );
    } finally {
      setPendingId(null);
    }
  };

  const visibleResults = canSearch
    ? results.filter((user) => user.id !== userId)
    : [];

  const isSearchOpen = searchFocused && visibleResults.length > 0;

  return (
    <BaseDialog dialogRef={dialogRef} title="Ajouter un ami" onClose={reset} onDialogNode={setDialogNode}>
      <Popover.Root open={isSearchOpen} onOpenChange={() => {}}>
        <Popover.Anchor className="flex flex-col gap-1.5">
        <label
          htmlFor="friend-search"
          className="text-xs font-semibold tracking-wide text-green-500 uppercase"
        >
          Pseudo
        </label>
        <Input
          id="friend-search"
          type="text"
          placeholder="Rechercher un pseudo..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          autoComplete="off"
        />
      </Popover.Anchor>

      <DropdownPanel container={dialogNode} matchAnchorWidth>
        {visibleResults.map((user) => {
          const isFriend = friendIds.includes(user.id);
          const isSent = sentIds.has(user.id);
          return(
            <div
              key={user.id}
              className="flex items-center gap-3 border-t border-green-100 px-4 py-2.5 first:border-t-0"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-green-800">{user.name}</p>
                <p className="truncate text-xs text-green-500">@{user.username}</p>
              </div>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => void handleSend(user)}
                disabled={isFriend || isSent || pendingId === user.id}
                className="shrink-0 cursor-pointer rounded-xl bg-green-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-green-100 disabled:text-green-500"
              >
                {isFriend ? 'Déjà ami' : isSent ? 'Envoyée' : 'Ajouter'}
              </button>
            </div>
          );
        })}
      </DropdownPanel>
    </Popover.Root>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {!canSearch && (
        <p className="text-sm text-green-400">
          Tape au moins {MIN_QUERY_LENGTH} caractères pour chercher.
        </p>
      )}

      {canSearch && !isSearching && visibleResults.length === 0 && !error && (
        <p className="text-sm text-green-400">Aucun utilisateur trouvé.</p>
      )}
    </BaseDialog>
  );
}
