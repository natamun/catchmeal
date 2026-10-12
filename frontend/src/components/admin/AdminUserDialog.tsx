import { useId, useRef, useState, type RefObject } from 'react';
import { Trash2 } from 'lucide-react';

import { Avatar } from '../ui/Avatar';
import { BaseDialog } from '../ui/BaseDialog';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { SelectDropdown } from '../ui/SelectDropdown';
import StatTile from '../ui/StatTile';
import { deleteUser, updateUserRole, type AdminUser } from './api';

const ROLE_OPTIONS = [
  { value: 'USER', label: 'Utilisateur' },
  { value: 'ADMIN', label: 'Administrateur' },
];

const PROVIDER_LABELS: Record<string, string> = {
  '42': '42',
  google: 'Google',
  github: 'GitHub',
};

interface PanelProps {
  user: AdminUser;
  container: HTMLElement | null;
  hasDeleteFailed: boolean;
  onUpdated: (changes: Partial<AdminUser>) => void;
}

function UserPanel({
  user,
  container,
  hasDeleteFailed,
  onUpdated,
}: PanelProps) {
  const roleId = useId();
  const [role, setRole] = useState(user.role);
  const [isSaving, setIsSaving] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  const handleSave = async () => {
    setHasFailed(false);
    setIsSaving(true);
    try {
      const updated = await updateUserRole(user.id, role);
      onUpdated({ role: updated.role });
    } catch {
      setHasFailed(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Avatar username={user.username} avatarUrl={user.avatarUrl} size="lg" />
        <div className="min-w-0">
          <p className="truncate font-semibold text-green-800">{user.name}</p>
          <p className="truncate text-sm text-green-600">{user.email}</p>
          <p className="text-xs text-green-500">
            {user.onlineStatus ? 'En ligne' : 'Hors ligne'}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3">
        <StatTile label="ID">{user.id}</StatTile>
        <StatTile label="Statut">
          {user.deletedAt ? 'Supprimé' : 'Actif'}
        </StatTile>
        <StatTile label="Connexion">
          {user.oauthProvider
            ? PROVIDER_LABELS[user.oauthProvider]
            : 'Mot de passe'}
        </StatTile>
        <StatTile label="Amis">{user._count?.userFriend ?? '–'}</StatTile>
        <StatTile label="Créé le">
          {new Date(user.createAt).toLocaleDateString('fr-FR')}
        </StatTile>
        <StatTile label="Dernière activité">
          {user.lastSeenAt
            ? new Date(user.lastSeenAt).toLocaleString('fr-FR', {
                dateStyle: 'short',
                timeStyle: 'short',
              })
            : '–'}
        </StatTile>
      </dl>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={roleId}
          className="text-xs font-semibold tracking-wide text-green-500 uppercase"
        >
          Rôle
        </label>
        <SelectDropdown
          id={roleId}
          value={role}
          options={ROLE_OPTIONS}
          onChange={(value) => setRole(value as AdminUser['role'])}
          container={container}
        />
      </div>

      {hasFailed && (
        <p role="alert" className="text-sm text-red-500">
          Impossible d&apos;enregistrer le rôle. Réessayez.
        </p>
      )}
      {hasDeleteFailed && (
        <p role="alert" className="text-sm text-red-500">
          Impossible de supprimer le compte. Réessayez.
        </p>
      )}

      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={isSaving || role === user.role}
        className="w-full cursor-pointer rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </div>
  );
}

interface Props {
  dialogRef: RefObject<HTMLDialogElement | null>;
  user: AdminUser | null;
  openCount: number;
  onUpdated: (changes: Partial<AdminUser>) => void;
}

export function AdminUserDialog({
  dialogRef,
  user,
  openCount,
  onUpdated,
}: Props) {
  const confirmDialogRef = useRef<HTMLDialogElement>(null);
  const [dialogNode, setDialogNode] = useState<HTMLDialogElement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasDeleteFailed, setHasDeleteFailed] = useState(false);

  const handleDelete = async () => {
    if (!user) {
      return;
    }

    setHasDeleteFailed(false);
    setIsDeleting(true);
    try {
      const deleted = await deleteUser(user.id);
      dialogRef.current?.close();
      onUpdated({ deletedAt: deleted.deletedAt });
    } catch {
      setHasDeleteFailed(true);
    } finally {
      setIsDeleting(false);
      confirmDialogRef.current?.close();
    }
  };

  return (
    <>
      <BaseDialog
        dialogRef={dialogRef}
        title={user ? `@${user.username}` : ''}
        maxWidth="sm"
        onClose={() => setHasDeleteFailed(false)}
        onDialogNode={setDialogNode}
        headerActions={
          user &&
          !user.deletedAt && (
            <button
              type="button"
              onClick={() => confirmDialogRef.current?.showModal()}
              aria-label="Supprimer le compte"
              className="cursor-pointer text-green-400 transition-colors hover:text-red-500"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )
        }
      >
        {user && (
          <UserPanel
            key={openCount}
            user={user}
            container={dialogNode}
            hasDeleteFailed={hasDeleteFailed}
            onUpdated={(changes) => {
              dialogRef.current?.close();
              onUpdated(changes);
            }}
          />
        )}
      </BaseDialog>

      <ConfirmDialog
        dialogRef={confirmDialogRef}
        title="Supprimer ce compte ?"
        description={`Le compte @${user?.username ?? ''} sera supprimé. Cette action est irréversible.`}
        confirmLabel="Supprimer"
        pendingLabel="Suppression..."
        isPending={isDeleting}
        onConfirm={() => void handleDelete()}
      />
    </>
  );
}
