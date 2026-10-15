import { useRef, useState } from 'react';
import { AlertCircle, Check, ChevronRight, LoaderCircle } from 'lucide-react';

import { useAuth } from '../../auth/auth-context';
import { useTimeout } from '../../hooks/useTimeout';
import { BaseDialog } from '../ui/BaseDialog';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import SummaryCard from '../ui/SummaryCard';
import { Toast } from '../ui/Toast';
import { deleteMyAccount, exportMyData, type DataExport } from './api';
import { ChangePasswordDialog } from './ChangePasswordDialog';

const ROW_CLASS =
  'flex w-full cursor-pointer items-center justify-between border-b border-green-200 px-6 py-4 text-left text-sm transition-colors last:border-b-0';

const chevron = (
  <ChevronRight className="h-4 w-4 opacity-40" aria-hidden="true" />
);

function escapeHtml(value: unknown): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildExportHtml(data: DataExport): string {
  const p = data.data.profile;

  const fmt = (v: unknown) =>
    v === null || v === undefined ? '—' : escapeHtml(v);
  const fmtDate = (v: string | null | undefined) =>
    v ? new Date(v).toLocaleDateString('fr-FR') : '—';
  const fmtDateTime = (v: string | null | undefined) =>
    v ? new Date(v).toLocaleString('fr-FR') : '—';

  const activityLabels: Record<string, string> = {
    MEAL_LOGGED: 'Repas enregistré',
    WEIGHT_LOGGED: 'Poids enregistré',
    GOAL_REACHED: 'Objectif atteint',
    CALORIE_GOAL_CHANGED: 'Objectif calorique modifié',
    WEIGHT_GOAL_REACHED: 'Objectif de poids atteint',
    STREAK_REACHED: 'Série atteinte',
  };

  const friendRows = (p.userFriend ?? [])
    .map(
      (f) =>
        `<tr><td>${escapeHtml(f.friendUser.name)} (@${escapeHtml(f.friendUser.username)})</td><td>${escapeHtml(f.status)}</td><td>${fmtDateTime(f.lastTimeConnected)}</td></tr>`,
    )
    .join('');

  const mealRows = (p.meal ?? [])
    .map((m) => {
      const totalKcal = m.items.reduce((s, i) => s + i.kcal, 0);
      return `<tr><td>${fmt(m.name ?? '—')}</td><td>${fmt(m.typeMeal)}</td><td>${fmtDate(m.loggedAt)}</td><td>${totalKcal.toFixed(0)} kcal</td></tr>`;
    })
    .join('');

  const foodRows = (p.foodItems ?? [])
    .map(
      (f) =>
        `<tr><td>${escapeHtml(f.name)}${f.brand ? ` (${escapeHtml(f.brand)})` : ''}</td><td>${f.kcal}</td><td>${f.protein}g</td><td>${f.carbs}g</td><td>${f.fat}g</td></tr>`,
    )
    .join('');

  const weightRows = (p.weightLogs ?? [])
    .map(
      (w) =>
        `<tr><td>${fmtDateTime(w.loggedAt)}</td><td>${w.weight} kg</td><td>${fmt(w.bodyFat ? w.bodyFat + '%' : null)}</td><td>${fmt(w.muscleMass ? w.muscleMass + ' kg' : null)}</td></tr>`,
    )
    .join('');

  const goalRows = (p.goalSettings ?? [])
    .map(
      (g) =>
        `<tr><td>${fmtDateTime(g.startDate)}</td><td>${g.dailyCalories} kcal</td><td>${fmt(g.dailyProtein ? g.dailyProtein + 'g' : null)}</td><td>${fmt(g.dailyCarbs ? g.dailyCarbs + 'g' : null)}</td><td>${fmt(g.dailyFat ? g.dailyFat + 'g' : null)}</td><td>${fmt(g.objective)}</td></tr>`,
    )
    .join('');

  const msgSentRows = (p.senderMessage ?? [])
    .map(
      (m) =>
        `<tr><td>${fmtDateTime(m.sentAt)}</td><td>${escapeHtml(m.content)}</td><td>${fmtDateTime(m.readAt)}</td></tr>`,
    )
    .join('');

  const msgReceivedRows = (p.receiverMessage ?? [])
    .map(
      (m) =>
        `<tr><td>${fmtDateTime(m.sentAt)}</td><td>${escapeHtml(m.content)}</td><td>${fmtDateTime(m.readAt)}</td></tr>`,
    )
    .join('');

  const activityRows = (p.activities ?? [])
    .map(
      (a) =>
        `<tr><td>${fmtDateTime(a.createdAt)}</td><td>${escapeHtml(activityLabels[a.type] ?? a.type)}</td><td>${a.metadata ? escapeHtml(JSON.stringify(a.metadata)) : '—'}</td></tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Mes données CatchMeal</title>
  <style>
    body { font-family: sans-serif; max-width: 900px; margin: 40px auto; padding: 0 20px; color: #1a2e1a; }
    h1 { color: #16a34a; }
    h2 { color: #15803d; border-bottom: 1px solid #bbf7d0; padding-bottom: 6px; margin-top: 32px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th { background: #f0fdf4; padding: 8px 12px; text-align: left; font-size: 13px; color: #166534; border-bottom: 2px solid #bbf7d0; }
    td { padding: 8px 12px; border-bottom: 1px solid #dcfce7; font-size: 13px; }
    td:first-child { font-weight: 600; color: #166534; }
    .meta { font-size: 13px; color: #6b7280; margin-bottom: 24px; }
    .empty { color: #9ca3af; font-style: italic; font-size: 13px; margin-top: 8px; }
  </style>
</head>
<body>
  <h1>Mes données personnelles sur CatchMeal</h1>
  <p class="meta">Exporté le ${new Date(data.exportedAt).toLocaleString('fr-FR')}</p>

  <h2>Profil</h2>
  <table>
    <tr><td>Nom d'utilisateur</td><td>${fmt(p.username)}</td></tr>
    <tr><td>Nom</td><td>${fmt(p.name)}</td></tr>
    <tr><td>Email</td><td>${fmt(p.email)}</td></tr>
    <tr><td>Photo de profil</td><td>${fmt(p.avatarUrl)}</td></tr>
    <tr><td>Membre depuis</td><td>${fmtDate(p.createAt)}</td></tr>
    <tr><td>Dernière connexion</td><td>${fmtDateTime(p.lastSeenAt)}</td></tr>
  </table>

  <h2>Données de santé</h2>
  <table>
    <tr><td>Taille</td><td>${p.height ? p.height + ' cm' : '—'}</td></tr>
    <tr><td>Poids cible</td><td>${p.targetWeight ? p.targetWeight + ' kg' : '—'}</td></tr>
    <tr><td>Genre</td><td>${fmt(p.gender)}</td></tr>
    <tr><td>Date de naissance</td><td>${fmtDate(p.birthDate)}</td></tr>
    <tr><td>Niveau d'activité</td><td>${fmt(p.activityLevel)}</td></tr>
    <tr><td>Masse grasse</td><td>${p.bodyFat ? p.bodyFat + '%' : '—'}</td></tr>
    <tr><td>Masse maigre</td><td>${p.fatFreeMass ? p.fatFreeMass + ' kg' : '—'}</td></tr>
    <tr><td>Eau corporelle</td><td>${p.bodyWater ? p.bodyWater + '%' : '—'}</td></tr>
    <tr><td>Masse musculaire</td><td>${p.muscleMass ? p.muscleMass + ' kg' : '—'}</td></tr>
  </table>

  <h2>Objectifs nutritionnels actuels</h2>
  <table>
    <tr><td>Calories / jour</td><td>${p.dailyCalorieGoal ? p.dailyCalorieGoal + ' kcal' : '—'}</td></tr>
    <tr><td>Protéines / jour</td><td>${p.dailyProteinGoal ? p.dailyProteinGoal + ' g' : '—'}</td></tr>
    <tr><td>Glucides / jour</td><td>${p.dailyCarbsGoal ? p.dailyCarbsGoal + ' g' : '—'}</td></tr>
    <tr><td>Lipides / jour</td><td>${p.dailyFatGoal ? p.dailyFatGoal + ' g' : '—'}</td></tr>
  </table>

  <h2>Historique des objectifs (${(p.goalSettings ?? []).length})</h2>
  ${goalRows ? `<table><thead><tr><th>Date</th><th>Calories</th><th>Protéines</th><th>Glucides</th><th>Lipides</th><th>Objectif</th></tr></thead><tbody>${goalRows}</tbody></table>` : '<p class="empty">Aucun objectif enregistré.</p>'}

  <h2>Repas enregistrés (${(p.meal ?? []).length})</h2>
  ${mealRows ? `<table><thead><tr><th>Nom</th><th>Type</th><th>Date</th><th>Total</th></tr></thead><tbody>${mealRows}</tbody></table>` : '<p class="empty">Aucun repas enregistré.</p>'}

  <h2>Aliments créés (${(p.foodItems ?? []).length})</h2>
  ${foodRows ? `<table><thead><tr><th>Aliment</th><th>Kcal</th><th>Protéines</th><th>Glucides</th><th>Lipides</th></tr></thead><tbody>${foodRows}</tbody></table>` : '<p class="empty">Aucun aliment créé.</p>'}

  <h2>Historique de poids (${(p.weightLogs ?? []).length})</h2>
  ${weightRows ? `<table><thead><tr><th>Date</th><th>Poids</th><th>Masse grasse</th><th>Masse musculaire</th></tr></thead><tbody>${weightRows}</tbody></table>` : '<p class="empty">Aucune entrée de poids.</p>'}

  <h2>Amis (${(p.userFriend ?? []).length})</h2>
  ${friendRows ? `<table><thead><tr><th>Ami</th><th>Statut</th><th>Dernière connexion</th></tr></thead><tbody>${friendRows}</tbody></table>` : '<p class="empty">Aucun ami.</p>'}

  <h2>Messages envoyés (${(p.senderMessage ?? []).length})</h2>
  ${msgSentRows ? `<table><thead><tr><th>Date</th><th>Contenu</th><th>Lu le</th></tr></thead><tbody>${msgSentRows}</tbody></table>` : '<p class="empty">Aucun message envoyé.</p>'}

  <h2>Messages reçus (${(p.receiverMessage ?? []).length})</h2>
  ${msgReceivedRows ? `<table><thead><tr><th>Date</th><th>Contenu</th><th>Lu le</th></tr></thead><tbody>${msgReceivedRows}</tbody></table>` : '<p class="empty">Aucun message reçu.</p>'}

  <h2>Activités (${(p.activities ?? []).length})</h2>
  ${activityRows ? `<table><thead><tr><th>Date</th><th>Type</th><th>Données</th></tr></thead><tbody>${activityRows}</tbody></table>` : '<p class="empty">Aucune activité enregistrée.</p>'}

</body>
</html>`;
}

export function GdprSection({
  onPolitiqueConfidentialite,
}: {
  onPolitiqueConfidentialite: () => void;
}) {
  const { logout, user } = useAuth();
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteErrorToast, setDeleteErrorToast] = useState<string | null>(null);
  const deleteDialogRef = useRef<HTMLDialogElement | null>(null);
  const exportSuccessDialogRef = useRef<HTMLDialogElement | null>(null);
  const exportErrorDialogRef = useRef<HTMLDialogElement | null>(null);
  const deleteSuccessDialogRef = useRef<HTMLDialogElement | null>(null);
  const changePasswordDialogRef = useRef<HTMLDialogElement | null>(null);
  const [passwordToast, setPasswordToast] = useState<string | null>(null);

  useTimeout(() => setPasswordToast(null), passwordToast ? 3000 : null);

  async function handleExport() {
    if (!user) return;
    setExportLoading(true);
    try {
      const data = await exportMyData();
      const blob = new Blob([buildExportHtml(data)], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'mes-donnees-catchmeal.html';
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
      await deleteMyAccount();
      deleteDialogRef.current?.close();
      deleteSuccessDialogRef.current?.showModal();
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

  return (
    <>
      <SummaryCard title="Compte" className="overflow-hidden">
        <div className="-mx-6 -mb-6 border-t border-green-200">
          <button
            type="button"
            onClick={() => void logout()}
            className={`${ROW_CLASS} text-green-600 hover:bg-green-50`}
          >
            Se déconnecter {chevron}
          </button>
          <button
            type="button"
            onClick={() => void handleExport()}
            disabled={exportLoading}
            className={`${ROW_CLASS} text-green-600 hover:bg-green-50 disabled:pointer-events-none`}
          >
            {exportLoading ? 'Export en cours...' : 'Exporter mes données'}
            {exportLoading ? (
              <LoaderCircle
                className="h-4 w-4 animate-spin text-green-400"
                aria-hidden="true"
              />
            ) : (
              chevron
            )}
          </button>
          {user?.hasPassword !== false && (
            <button
              type="button"
              onClick={() => changePasswordDialogRef.current?.showModal()}
              className={`${ROW_CLASS} text-green-600 hover:bg-green-50`}
            >
              Changer le mot de passe {chevron}
            </button>
          )}
          <button
            type="button"
            onClick={onPolitiqueConfidentialite}
            className={`${ROW_CLASS} text-green-600 hover:bg-green-50`}
          >
            Politique de confidentialité et RGPD {chevron}
          </button>
          <button
            type="button"
            onClick={openDeleteDialog}
            className={`${ROW_CLASS} text-red-500 hover:bg-red-50`}
          >
            Supprimer mon compte {chevron}
          </button>
        </div>
      </SummaryCard>

      <BaseDialog
        dialogRef={exportSuccessDialogRef}
        title="Export réussi"
        maxWidth="sm"
      >
        <p className="text-sm text-green-600">
          Vos données ont été téléchargées. Ouvrez le fichier{' '}
          <strong>mes-donnees-catchmeal.html</strong> dans votre navigateur pour
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

      <ConfirmDialog
        dialogRef={deleteDialogRef}
        title="Supprimer mon compte"
        description="Cette action est irréversible. Toutes vos données seront anonymisées et vous ne pourrez plus vous reconnecter."
        confirmLabel="Confirmer la suppression"
        pendingLabel="Suppression..."
        isPending={deleteLoading}
        onConfirm={() => void handleDeleteAccount()}
      />

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

      <ChangePasswordDialog
        dialogRef={changePasswordDialogRef}
        onSuccess={() => setPasswordToast('Mot de passe modifié')}
      />

      <Toast message={passwordToast} icon={Check} />

      <Toast message={deleteErrorToast} icon={AlertCircle} />
    </>
  );
}
