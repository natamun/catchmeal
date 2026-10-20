import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { useCurrentUser } from '../auth/authContext';
import AddFriendDialog from '../components/friends/AddFriendDialog';
import {
  acceptFriendRequest,
  removeFriendship,
} from '../components/friends/api';
import FriendRow from '../components/friends/FriendRow';
import FriendsActivity from '../components/friends/FriendsActivity';
import RequestRow from '../components/friends/RequestRow';
import type {
  ActivityItem,
  Friend,
  UserSummary,
} from '../components/friends/types';
import ChatWindow from '../components/messages/ChatWindow';
import { AddCircleButton } from '../components/ui/AddCircleButton';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import {
  ListCard,
  ListCardEmpty,
  ListCardLoading,
} from '../components/ui/ListCard';
import { LoadError } from '../components/ui/LoadError';
import { useToast } from '../components/ui/toastContext';
import { useActivityFeed } from '../hooks/useActivityFeed';
import { useFriends } from '../hooks/useFriends';
import { usePresence } from '../hooks/usePresence';
import { useUnreadMessages } from '../hooks/useUnreadMessages';
import { navigationState } from '../routing/navigation';
import { requestErrorMessage } from '../utils/requestErrorMessage';

type Tab = 'friends' | 'requests';

const TAB_OPTIONS: { value: Tab; label: string }[] = [
  { value: 'friends', label: 'Mes amis' },
  { value: 'requests', label: 'Demandes' },
];

export default function FriendsPage() {
  const { userId } = useCurrentUser();
  const location = useLocation();
  const navigate = useNavigate();
  const replyTo = navigationState(location).replyTo ?? null;
  const {
    friends,
    requests,
    sentRequestIds,
    isLoading,
    loadError,
    reload,
    retry,
  } = useFriends(userId);
  const activities = useActivityFeed(userId);
  const [activeTab, setActiveTab] = useState<Tab>('friends');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [friendToRemove, setFriendToRemove] = useState<Friend | null>(null);
  const showToast = useToast();
  const [actionError, setActionError] = useState<string | null>(null);
  const addDialogRef = useRef<HTMLDialogElement>(null);
  const confirmDialogRef = useRef<HTMLDialogElement>(null);
  const [chatActivity, setChatActivity] = useState<ActivityItem | null>(
    replyTo,
  );
  const [chatFriend, setChatFriend] = useState<UserSummary | null>(
    () => replyTo?.user ?? null,
  );
  const chatDialogRef = useRef<HTMLDialogElement>(null);
  const presence = usePresence(userId);
  const unreadIds = useUnreadMessages(userId, chatFriend?.id ?? null);

  useEffect(() => {
    if (replyTo) {
      void navigate(location.pathname, { replace: true });
    }
  }, [replyTo, navigate, location.pathname]);

  const runAction = async (
    id: number,
    action: () => Promise<unknown>,
    message: string,
  ) => {
    setActionError(null);
    setBusyId(id);
    try {
      await action();
      showToast(message);
      reload();
    } catch (err: unknown) {
      setActionError(
        requestErrorMessage(err, 'Une erreur est survenue, réessayez.'),
      );
    } finally {
      setBusyId(null);
      confirmDialogRef.current?.close();
    }
  };

  const list = activeTab === 'friends' ? friends : requests;
  const emptyMessage =
    activeTab === 'friends'
      ? "Tu n'as pas encore d'amis. Utilise le bouton + pour en ajouter !"
      : 'Aucune demande en attente.';

  return (
    <>
      <div className="flex flex-col gap-6">
        <h1 className="sr-only">Amis</h1>
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5 self-start rounded-xl border border-green-200 bg-white p-1.5">
            {TAB_OPTIONS.map(({ value, label }) => (
              <label
                key={value}
                className="relative flex cursor-pointer items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium text-green-500 transition-colors has-checked:animate-pill-select has-checked:bg-green-500 has-checked:text-white has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-green-400"
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
                  <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-green-100 px-1 text-xs font-bold text-green-700 ring-2 ring-white">
                    {requests.length}
                  </span>
                )}
              </label>
            ))}
          </div>
          <AddCircleButton
            label="Ajouter un ami"
            onClick={() => addDialogRef.current?.showModal()}
          />
        </div>

        {actionError && <p className="text-sm text-red-500">{actionError}</p>}

        <ListCard key={activeTab} className="animate-fade-in-up">
          {isLoading && <ListCardLoading label="Chargement..." />}

          {loadError && <LoadError message={loadError} onRetry={retry} />}

          {!isLoading && !loadError && list.length === 0 && (
            <ListCardEmpty>{emptyMessage}</ListCardEmpty>
          )}

          <ul className={loadError ? 'hidden' : undefined}>
            {activeTab === 'friends'
              ? friends.map((f) => (
                  <FriendRow
                    key={f.friendshipId}
                    friend={f.friend}
                    online={presence.get(f.friend.id)?.online ?? false}
                    lastSeenAt={presence.get(f.friend.id)?.lastSeenAt ?? null}
                    hasUnread={unreadIds.has(f.friend.id)}
                    onMessage={() => {
                      setChatFriend(f.friend);
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
        </ListCard>

        <FriendsActivity
          activities={activities}
          presence={presence}
          onReply={(activity) => {
            setChatFriend(activity.user);
            setChatActivity(activity);
          }}
        />
      </div>

      <AddFriendDialog
        userId={userId}
        dialogRef={addDialogRef}
        friendIds={friends.map((f) => f.friend.id)}
        sentRequestIds={sentRequestIds}
        receivedRequestIds={requests.map((r) => r.from.id)}
        onSent={(username) => {
          showToast(`Demande envoyée à ${username}`);
          reload();
        }}
      />
      {chatFriend && (
        <ChatWindow
          dialogRef={chatDialogRef}
          friend={chatFriend}
          quotedActivity={chatActivity}
          onClose={() => {
            setChatFriend(null);
            setChatActivity(null);
          }}
        />
      )}

      <ConfirmDialog
        dialogRef={confirmDialogRef}
        title="Retirer cet ami ?"
        description={`${friendToRemove?.friend.name ?? 'Cet ami'} sera retiré de votre liste.`}
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
    </>
  );
}
