import { useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';

import { useAuth } from '../../auth/auth-context';
import { BaseDialog } from '../ui/BaseDialog';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Toast } from '../ui/Toast';

interface UserProfile {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  createAt: string;
  meal: unknown[];
  weightLogs: unknown[];
  goalSettings: unknown[];
  senderMessage: unknown[];
  receiverMessage: unknown[];
}

interface ExportResponse {
  exportedAt: string;
  data: { profile: UserProfile };
}

function escapeHtml(value: unknown): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildExportHtml(data: ExportResponse): string {
  const p = data.data.profile;
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Mes données KcalApp</title>
  <style>
    body { font-family: sans-serif; max-width: 700px; margin: 40px auto; padding: 0 20px; color: #1a2e1a; }
    h1 { color: #16a34a; }
    h2 { color: #15803d; border-bottom: 1px solid #bbf7d0; padding-bottom: 6px; margin-top: 32px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    td { padding: 8px 12px; border-bottom: 1px solid #dcfce7; font-size: 14px; }
    td:first-child { font-weight: 600; width: 40%; color: #166534; }
    .meta { font-size: 13px; color: #6b7280; margin-bottom: 24px; }
    .count { font-size: 14px; color: #374151; margin: 4px 0; }
  </style>
</head>
<body>
  <h1>Mes données personnelles — KcalApp</h1>
  <p class="meta">Exporté le ${new Date(data.exportedAt).toLocaleString('fr-FR')}</p>
  <h2>Profil</h2>
  <table>
    <tr><td>Identifiant</td><td>${escapeHtml(p.id)}</td></tr>
    <tr><td>Nom d'utilisateur</td><td>${escapeHtml(p.username)}</td></tr>
    <tr><td>Nom</td><td>${escapeHtml(p.name)}</td></tr>
    <tr><td>Email</td><td>${escapeHtml(p.email)}</td></tr>
    <tr><td>Rôle</td><td>${escapeHtml(p.role)}</td></tr>
    <tr><td>Membre depuis</td><td>${new Date(p.createAt).toLocaleDateString('fr-FR')}</td></tr>
  </table>
  <h2>Résumé de l'activité</h2>
  <p class="count">🍽️ Repas enregistrés : <strong>${p.meal.length}</strong></p>
  <p class="count">⚖️ Entrées de poids : <strong>${p.weightLogs.length}</strong></p>
  <p class="count">🎯 Objectifs définis : <strong>${p.goalSettings.length}</strong></p>
  <p class="count">💬 Messages envoyés : <strong>${p.senderMessage.length}</strong></p>
  <p class="count">📩 Messages reçus : <strong>${p.receiverMessage.length}</strong></p>
</body>
</html>`;
}

export function GdprSection() {
  const { logout, user } = useAuth();
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteErrorToast, setDeleteErrorToast] = useState<string | null>(null);
  const deleteDialogRef = useRef<HTMLDialogElement | null>(null);
  const exportSuccessDialogRef = useRef<HTMLDialogElement | null>(null);
  const exportErrorDialogRef = useRef<HTMLDialogElement | null>(null);
  const deleteSuccessDialogRef = useRef<HTMLDialogElement | null>(null);

  async function handleExport() {
    if (!user) return;
    setExportLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/gdpr/export/${user.userId}`,
        { credentials: 'include' },
      );
      if (!response.ok) throw new Error('Failed to fetch user data');
      const data = (await response.json()) as ExportResponse;
      const blob = new Blob([buildExportHtml(data)], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'mes-donnees-kcalapp.html';
      link.click();
      URL.revokeObjectURL(url);
      exportSuccessDialogRef.current?.showModal();
    } catch {
      exportErrorDialogRef.current?.showModal();
    } finally {
      setExportLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (!user) return;
    setDeleteLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/gdpr/account/${user.userId}`,
        { method: 'DELETE', credentials: 'include' },
      );
      if (!response.ok) throw new Error('Failed to delete account');
      deleteDialogRef.current?.close();
      deleteSuccessDialogRef.current?.showModal();
      // Logout regardless of how the success dialog is closed
      deleteSuccessDialogRef.current?.addEventListener(
        'close',
        () => void logout(),
        { once: true },
      );
    } catch {
      deleteDialogRef.current?.close();
      setDeleteErrorToast('Erreur lors de la suppression du compte');
      setTimeout(() => setDeleteErrorToast(null), 3000);
    } finally {
      setDeleteLoading(false);
    }
  }

  function openDeleteDialog() {
    deleteDialogRef.current?.showModal();
  }

  const ROW_CLASS =
    'flex w-full cursor-pointer items-center justify-between border-b border-green-200 px-5 py-4 text-left text-sm transition-colors last:border-b-0';

  const chevron = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 opacity-40"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-green-200 bg-white shadow-sm">
        <p className="px-5 pt-5 pb-3 text-xs font-semibold tracking-wide text-green-500 uppercase">
          Compte
        </p>
        <button
          onClick={() => void logout()}
          className={`${ROW_CLASS} text-green-600 hover:bg-white`}
        >
          Se déconnecter {chevron}
        </button>
        <button
          onClick={() => void handleExport()}
          disabled={exportLoading}
          className={`${ROW_CLASS} text-green-600 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {exportLoading ? 'Export en cours...' : 'Exporter mes données'}{' '}
          {chevron}
        </button>
        <button className={`${ROW_CLASS} text-green-600 hover:bg-white`}>
          Politique de confidentialité {chevron}
        </button>
        <button
          onClick={openDeleteDialog}
          className={`${ROW_CLASS} text-red-500 hover:bg-red-50`}
        >
          Supprimer mon compte {chevron}
        </button>
      </div>

      {/* Export success */}
      <BaseDialog
        dialogRef={exportSuccessDialogRef}
        title="Export réussi"
        maxWidth="sm"
      >
        <p className="text-sm text-green-600">
          Vos données ont été téléchargées. Ouvrez le fichier{' '}
          <strong>mes-donnees-kcalapp.html</strong> dans votre navigateur pour
          les consulter.
        </p>
        <button
          type="button"
          onClick={() => exportSuccessDialogRef.current?.close()}
          className="mt-2 w-full cursor-pointer rounded-xl bg-green-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-600"
        >
          OK
        </button>
      </BaseDialog>

      {/* Export error */}
      <BaseDialog
        dialogRef={exportErrorDialogRef}
        title="Erreur d'export"
        maxWidth="sm"
      >
        <p className="text-sm text-red-500">
          Impossible de récupérer vos données. Veuillez réessayer.
        </p>
        <button
          type="button"
          onClick={() => exportErrorDialogRef.current?.close()}
          className="mt-2 w-full cursor-pointer rounded-xl bg-green-100 px-4 py-2.5 text-sm font-semibold text-green-700 transition-colors hover:bg-green-200"
        >
          Fermer
        </button>
      </BaseDialog>

      {/* Delete confirm */}
      <ConfirmDialog
        dialogRef={deleteDialogRef}
        title="Supprimer mon compte"
        description="Cette action est irréversible. Toutes vos données seront anonymisées et vous ne pourrez plus vous reconnecter."
        confirmLabel="Confirmer la suppression"
        pendingLabel="Suppression..."
        isPending={deleteLoading}
        onConfirm={() => void handleDeleteAccount()}
      />

      {/* Delete success — shown before logout */}
      <BaseDialog
        dialogRef={deleteSuccessDialogRef}
        title="Compte supprimé"
        maxWidth="sm"
      >
        <p className="text-sm text-green-600">
          Votre compte a été supprimé. Un email de confirmation vous a été
          envoyé. Vous allez être déconnecté.
        </p>
        <button
          type="button"
          onClick={() => void logout()}
          className="mt-2 w-full cursor-pointer rounded-xl bg-green-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-600"
        >
          OK
        </button>
      </BaseDialog>

      {/* Delete error toast */}
      <Toast message={deleteErrorToast} icon={AlertCircle} />
    </>
  );
}
