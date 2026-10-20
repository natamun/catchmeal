import { useRef, useState } from 'react';
import { AlertCircle, ChevronRight, LoaderCircle } from 'lucide-react';
import { Link } from 'react-router';

import { useAuth } from '../../auth/auth-context';
import { PATHS } from '../../routes';
import { BaseDialog } from '../ui/BaseDialog';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { LoadError } from '../ui/LoadError';
import SummaryCard from '../ui/SummaryCard';
import { useToast } from '../ui/toast-context';
import { deleteMyAccount, exportMyData } from './api';
import { ChangePasswordDialog } from './ChangePasswordDialog';
import { buildExportHtml } from './exportHtml';

const ROW_CLASS =
  'flex w-full cursor-pointer items-center justify-between border-b border-green-200 px-6 py-4 text-left text-sm transition-colors last:border-b-0';

const chevron = (
  <ChevronRight className="h-4 w-4 opacity-40" aria-hidden="true" />
);

export function GdprSection() {
  const { logout, user } = useAuth();
  const [exportLoading, setExportLoading] = useState(false);
  const [lastExportFormat, setLastExportFormat] = useState<'html' | 'json'>(
    'html',
  );
  const [deleteLoading, setDeleteLoading] = useState(false);
  const deleteDialogRef = useRef<HTMLDialogElement | null>(null);
  const exportFormatDialogRef = useRef<HTMLDialogElement | null>(null);
  const exportSuccessDialogRef = useRef<HTMLDialogElement | null>(null);
  const exportErrorDialogRef = useRef<HTMLDialogElement | null>(null);
  const deleteSuccessDialogRef = useRef<HTMLDialogElement | null>(null);
  const changePasswordDialogRef = useRef<HTMLDialogElement | null>(null);
  const showToast = useToast();

  async function handleExport(format: 'html' | 'json') {
    if (!user) return;
    exportFormatDialogRef.current?.close();
    setLastExportFormat(format);
    setExportLoading(true);
    try {
      const data = await exportMyData();
      if (format === 'html') {
        const blob = new Blob([buildExportHtml(data)], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'mes-donnees-catchmeal.html';
        link.click();
        URL.revokeObjectURL(url);
      } else {
        const blob = new Blob([JSON.stringify(data.data.profile, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'mes-donnees-catchmeal.json';
        link.click();
        URL.revokeObjectURL(url);
      }
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
      showToast('Erreur lors de la suppression du compte', AlertCircle);
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
            onClick={() => exportFormatDialogRef.current?.showModal()}
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
          <Link
            to={PATHS.privacy}
            className={`${ROW_CLASS} text-green-600 hover:bg-green-50`}
          >
            Politique de confidentialité et RGPD {chevron}
          </Link>
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
        dialogRef={exportFormatDialogRef}
        title="Choisir le format d'export"
        maxWidth="sm"
      >
        <p className="text-sm text-green-600">
          Sélectionnez le format dans lequel vous souhaitez télécharger vos
          données.
        </p>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => void handleExport('html')}
            className="w-full cursor-pointer rounded-xl bg-green-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-600"
          >
            HTML — lisible dans un navigateur
          </button>
          <button
            type="button"
            onClick={() => void handleExport('json')}
            className="w-full cursor-pointer rounded-xl border border-green-200 px-4 py-2.5 text-sm font-semibold text-green-700 transition-colors hover:bg-green-50"
          >
            JSON — format structuré pour applications
          </button>
        </div>
      </BaseDialog>

      <BaseDialog
        dialogRef={exportSuccessDialogRef}
        title="Export réussi"
        maxWidth="sm"
      >
        <p className="text-sm text-green-600">
          {lastExportFormat === 'html' ? (
            <>
              Vos données ont été téléchargées. Ouvrez le fichier{' '}
              <strong>mes-donnees-catchmeal.html</strong> dans votre navigateur
              pour les consulter.
            </>
          ) : (
            <>
              Vos données ont été téléchargées. Ouvrez le fichier{' '}
              <strong>mes-donnees-catchmeal.json</strong> dans n'importe quel
              éditeur de texte pour les consulter.
            </>
          )}
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
        <LoadError
          message="Impossible d'exporter vos données."
          onRetry={() => {
            exportErrorDialogRef.current?.close();
            void handleExport(lastExportFormat);
          }}
        />
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
        onSuccess={() => showToast('Mot de passe modifié')}
      />
    </>
  );
}
