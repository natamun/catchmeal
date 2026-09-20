import { useEffect, useRef, useState } from 'react';

import type { AuthUser } from '../../auth/auth-context';
import { Avatar } from '../ui/Avatar';
import { Input } from '../ui/Input';
import { updateProfile, uploadAvatar, type UserProfile } from './api';

interface Props {
  user: AuthUser;
  onUpdate: (partial: Partial<AuthUser>) => void;
}

export function ProfileIdentityCard({ user, onUpdate }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [draftUsername, setDraftUsername] = useState(user.username);
  const [draftName, setDraftName] = useState(user.name ?? '');
  const [draftHeight, setDraftHeight] = useState(user.height?.toString() ?? '');
  const [draftTargetWeight, setDraftTargetWeight] = useState(
    user.targetWeight?.toString() ?? '',
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setTimeout(() => usernameRef.current?.focus(), 0);
    }
  }, [editing]);

  function handleEdit() {
    setDraftUsername(user.username);
    setDraftName(user.name ?? '');
    setDraftHeight(user.height?.toString() ?? '');
    setDraftTargetWeight(user.targetWeight?.toString() ?? '');
    setSaveError(null);
    setEditing(true);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    try {
      const updated = await uploadAvatar(user.userId, file);
      onUpdate({ avatarUrl: updated.avatarUrl });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Échec de l'upload");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleSave() {
    const trimmedUsername = draftUsername.trim();
    const trimmedName = draftName.trim();

    if (
      trimmedUsername === user.username &&
      trimmedName === (user.name ?? '') &&
      draftHeight === (user.height?.toString() ?? '') &&
      draftTargetWeight === (user.targetWeight?.toString() ?? '')
    ) {
      setEditing(false);
      return;
    }

    const input: {
      username?: string;
      name?: string;
      height?: number;
      targetWeight?: number;
    } = {};
    if (trimmedUsername !== user.username) input.username = trimmedUsername;
    if (trimmedName !== (user.name ?? '')) input.name = trimmedName;
    const parsedHeight = draftHeight ? parseFloat(draftHeight) : undefined;
    if (
      parsedHeight !== undefined &&
      (parsedHeight <= 0 || parsedHeight > 300)
    ) {
      setSaveError('La taille doit être entre 1 et 300 cm');
      return;
    }
    if (parsedHeight !== (user.height ?? undefined))
      input.height = parsedHeight;
    const parsedTargetWeight = draftTargetWeight
      ? parseFloat(draftTargetWeight)
      : undefined;
    if (parsedTargetWeight !== (user.targetWeight ?? undefined))
      input.targetWeight = parsedTargetWeight;

    setSaving(true);
    setSaveError(null);
    try {
      const updated: UserProfile = await updateProfile(user.userId, input);
      onUpdate({
        username: updated.username,
        name: updated.name,
        height: updated.height ?? undefined,
        targetWeight: updated.targetWeight ?? undefined,
      });
      setEditing(false);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : 'Erreur lors de la sauvegarde',
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setEditing(false);
    setSaveError(null);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') void handleSave();
    if (e.key === 'Escape') handleCancel();
  }

  return (
    <div className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-5">
        <Avatar
          username={user.username}
          avatarUrl={user.avatarUrl}
          size="lg"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          editable
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void handleFileChange(e)}
        />

        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="flex flex-col gap-2">
              <div>
                <label
                  htmlFor="draft-username"
                  className="mb-1 block text-xs font-medium text-green-600"
                >
                  Nom d'utilisateur
                </label>
                <Input
                  id="draft-username"
                  ref={usernameRef}
                  value={draftUsername}
                  onChange={(e) => setDraftUsername(e.target.value)}
                  onKeyDown={handleKeyDown}
                  minLength={3}
                  maxLength={30}
                />
              </div>
              <div>
                <label
                  htmlFor="draft-name"
                  className="mb-1 block text-xs font-medium text-green-600"
                >
                  Nom complet
                </label>
                <Input
                  id="draft-name"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  maxLength={80}
                />
              </div>
              <div>
                <label
                  htmlFor="draft-height"
                  className="mb-1 block text-xs font-medium text-green-600"
                >
                  Taille (cm)
                </label>
                <Input
                  id="draft-height"
                  type="number"
                  min={50}
                  max={300}
                  value={draftHeight}
                  onChange={(e) => setDraftHeight(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div>
                <label
                  htmlFor="draft-target-weight"
                  className="mb-1 block text-xs font-medium text-green-600"
                >
                  Poids cible (kg)
                </label>
                <Input
                  id="draft-target-weight"
                  type="number"
                  min={20}
                  max={500}
                  step={0.1}
                  value={draftTargetWeight}
                  onChange={(e) => setDraftTargetWeight(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              {saveError && <p className="text-xs text-red-500">{saveError}</p>}
            </div>
          ) : (
            <>
              <p className="text-lg font-bold text-green-800">
                {user.username}
              </p>
              {user.name && (
                <p className="text-sm text-green-500">{user.name}</p>
              )}
              {uploading && (
                <p className="text-sm text-green-400">Upload en cours...</p>
              )}
              {uploadError && (
                <p className="text-sm text-red-500">{uploadError}</p>
              )}
            </>
          )}
        </div>

        <div className="shrink-0">
          {editing ? (
            <div className="flex gap-2">
              <button
                onClick={() => void handleSave()}
                disabled={saving || draftUsername.trim().length < 3}
                className="rounded-lg bg-green-400 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-500 disabled:opacity-50"
              >
                {saving ? '...' : 'Sauver'}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="rounded-lg border border-green-200 px-3 py-1.5 text-xs font-medium text-green-500 transition-colors hover:bg-green-50"
              >
                Annuler
              </button>
            </div>
          ) : (
            <button
              onClick={handleEdit}
              className="cursor-pointer text-sm font-medium text-green-300 transition-colors hover:text-green-400"
            >
              Modifier
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
