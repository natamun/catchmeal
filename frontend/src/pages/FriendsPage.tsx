import { useRef, useState } from 'react';
import { CheckCircle2, LoaderCircle, Plus } from 'lucide-react';

import { useAuth } from '../auth/auth-context.ts';
import AddFriendDialog from '../components/friends/AddFriendDialog.tsx';
import {
  acceptFriendRequest,
  ApiError,
  removeFriendship,
} from '../components/friends/api.ts';
import { Avatar } from '../components/friends/Avatar.tsx';
import FriendRow from '../components/friends/FriendRow.tsx';
import RequestRow from '../components/friends/RequestRow.tsx';
import type { Friend, UserSummary } from '../components/friends/types.ts';
import ChatWindow from '../components/messages/ChatWindow.tsx';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.tsx';
import { Toast } from '../components/ui/Toast.tsx';
import { useFriends } from '../hooks/useFriends.ts';
import { useTimeout } from '../hooks/useTimeout.ts';

type Tab = 'friends' | 'requests';

const TAB_OPTIONS: { value: Tab; label: string }[] = [
  { value: 'friends', label: 'Mes amis' },
  { value: 'requests', label: 'Demandes' },
];

const ACTIVITY = [
  {
    id: 1,
    username: 'alice',
    action: 'a ajouté un repas (540 kcal)',
    time: 'il y a 5 min',
    online: true,
  },
  {
    id: 2,
    username: 'bob',
    action: 'a atteint son objectif du jour',
    time: 'il y a 23 min',
    online: false,
  },
  {
    id: 3,
    username: 'carol',
    action: 'a enregistré son poids (63 kg)',
    time: 'il y a 1h',
    online: true,
  },
  {
    id: 4,
    username: 'david',
    action: 'a scanné un nouveau produit',
    time: 'il y a 2h',
    online: false,
  },
];

export default function FriendsPage() {
  const { user } = useAuth();
  const userId = user!.userId;
  const { friends, requests, sentRequestIds, isLoading, loadError, reload } =
    useFriends(userId);
  const [activeTab, setActiveTab] = useState<Tab>('friends');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [friendToRemove, setFriendToRemove] = useState<Friend | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const addDialogRef = useRef<HTMLDialogElement>(null);
  const confirmDialogRef = useRef<HTMLDialogElement>(null);
  const [chatFriend, setChatFriend] = useState<UserSummary | null>(null);
  const chatDialogRef = useRef<HTMLDialogElement>(null);

  useTimeout(() => setSuccessMessage(null), successMessage ? 3000 : null);

  const runAction = async (
    id: number,
    action: () => Promise<unknown>,
    message: string,
  ) => {
    setActionError(null);
    setBusyId(id);
    try {
      await action();
      setSuccessMessage(message);
      reload();
    } catch (err: unknown) {
      console.error(err);
      setActionError(
        err instanceof ApiError
          ? err.message
          : 'Une erreur est survenue, réessaye.',
      );
    } finally {
      setBusyId(null);
      confirmDialogRef.current?.close();
    }
  };

  const list = activeTab === 'friends' ? friends : requests;
  const emptyMessage =
    activeTab === 'friends'
      ? "Aucun ami pour l'instant."
      : 'Aucune demande en attente.';

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5 self-start rounded-xl border border-green-200 bg-white p-1.5">
            {TAB_OPTIONS.map(({ value, label }) => (
              <label
                key={value}
                className="flex cursor-pointer items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium text-green-500 transition-colors has-checked:animate-pill-select has-checked:bg-green-500 has-checked:text-white has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-green-400"
              >
                <input
                  type="radio"
                  name="friendsPageTab"
                  value={value}
                  checked={activeTab === value}
                  onChange={() => setActiveTab(value)}
                  className="sr-only"
                />
                {label}
                {value === 'requests' && requests.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 text-xs font-bold text-amber-700">
                    {requests.length}
                  </span>
                )}
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={() => addDialogRef.current?.showModal()}
            aria-label="Ajouter un ami"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-green-500 text-white transition-colors hover:bg-green-600"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {actionError && <p className="test-sm test-red-500">{actionError}</p>}

        <div className="overflow-hidden rounded-2xl border border-green-200 bg-white shadow-sm">
          {isLoading && (
            <div role="status" className="flex justify-center py-10">
              <LoaderCircle className="h-6 w-6 animate-spin text-green-400" />
              <span className="sr-only">Chargement...</span>
            </div>
          )}

          {loadError && (
            <p className="px-5 py-5 text-sm text-red-500">{loadError}</p>
          )}

          {!isLoading && !loadError && list.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-green-400">
              {emptyMessage}
            </p>
          )}

          <ul>
            {activeTab === 'friends'
              ? friends.map((f) => (
                  <FriendRow
                    key={f.friendshipId}
                    friend={f.friend}
                    onMessage={() => {
                      setChatFriend(f.friend);
                      chatDialogRef.current?.showModal();
                    }}
                    onRemove={() => {
                      setFriendToRemove(f);
                      confirmDialogRef.current?.showModal();
                    }}
                  />
                ))
              : requests.map((r) => (
                  <RequestRow
                    key={r.requestId}
                    from={r.from}
                    isBusy={busyId === r.requestId}
                    onAccept={() =>
                      void runAction(
                        r.requestId,
                        () => acceptFriendRequest(userId, r.requestId),
                        'Ami ajouté',
                      )
                    }
                    onDecline={() =>
                      void runAction(
                        r.requestId,
                        () => removeFriendship(userId, r.requestId),
                        'Demande refusée',
                      )
                    }
                  />
                ))}
          </ul>
        </div>

        {/* Activité récente */}
        <div className="rounded-2xl border border-green-200 bg-white p-5 shadow-sm">
          <p className="mb-4 text-xs font-semibold tracking-wide text-green-500 uppercase">
            Activité récente
          </p>
          <ul className="flex flex-col gap-4">
            {ACTIVITY.map((a) => (
              <li key={a.id} className="flex items-center gap-3">
                <Avatar username={a.username} online={a.online} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-green-800">
                    <span className="font-semibold">{a.username}</span>{' '}
                    {a.action}
                  </p>
                  <p className="text-xs text-green-500">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <AddFriendDialog
        userId={userId}
        dialogRef={addDialogRef}
        friendIds={friends.map((f) => f.friend.id)}
        sentRequestIds={sentRequestIds}
        onSent={(username) => {
          setSuccessMessage(`Demande envoyée à ${username}`);
          reload();
        }}
      />
      {chatFriend && (
        <ChatWindow dialogRef={chatDialogRef} friend={chatFriend} />
      )}

      <ConfirmDialog
        dialogRef={confirmDialogRef}
        title="Retirer cet ami ?"
        description={`${friendToRemove?.friend.name ?? 'Cet ami'} sera retiré de ta liste.`}
        confirmLabel="Retirer"
        pendingLabel="Suppression..."
        isPending={busyId === friendToRemove?.friendshipId}
        onConfirm={() => {
          if (friendToRemove) {
            void runAction(
              friendToRemove.friendshipId,
              () => removeFriendship(userId, friendToRemove.friendshipId),
              'Ami retiré',
            );
          }
        }}
      />

      <Toast message={successMessage} icon={CheckCircle2} />
    </>
  );
}
