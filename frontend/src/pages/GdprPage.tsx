import { useState } from 'react';

// Matches the User model in the Prisma schema
interface UserData {
  id: number;
  username: string;
  name: string;
}

interface ExportResponse {
  exportedAt: string;
  data: {
    profile: UserData;
  };
}

function GdprPage() {
  // Export state
  const [exportData, setExportData] = useState<ExportResponse | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Deletion state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Hardcoded to user 1 for now — will be replaced with real auth later
  const userId = 1;

  async function handleExport() {
    setExportLoading(true);
    setExportError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/gdpr/export/${userId}`,
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data: ExportResponse = await response.json();
      setExportData(data);
    } catch {
      setExportError('Could not retrieve your data. Please try again.');
    } finally {
      setExportLoading(false);
    }
  }

  function handleDownload() {
    if (!exportData) return;

    // Convert data to JSON string and trigger a file download
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'my-data.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/gdpr/account/${userId}`,
        { method: 'DELETE' },
      );

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      setDeleteSuccess(true);
      setShowDeleteConfirm(false);
    } catch {
      setDeleteError('Could not delete your account. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <main>
      <h1>My Personal Data</h1>
      <p>
        In accordance with GDPR, you can view and download a copy of all the
        personal data we hold about you.
      </p>

      {/* --- Data export section --- */}
      <button onClick={handleExport} disabled={exportLoading}>
        {exportLoading ? 'Loading...' : 'View my data'}
      </button>

      {exportError && <p style={{ color: 'red' }}>{exportError}</p>}

      {exportData && (
        <section>
          <h2>Your data</h2>
          <p>
            <strong>Exported at:</strong> {exportData.exportedAt}
          </p>
          <h3>Profile</h3>
          <ul>
            <li>
              <strong>ID:</strong> {exportData.data.profile.id}
            </li>
            <li>
              <strong>Username:</strong> {exportData.data.profile.username}
            </li>
            <li>
              <strong>Name:</strong> {exportData.data.profile.name}
            </li>
          </ul>
          <button onClick={handleDownload}>Download as JSON</button>
        </section>
      )}

      <hr />

      {/* --- Account deletion section --- */}
      <section>
        <h2>Delete my account</h2>

        {deleteSuccess ? (
          <p>
            Your account has been successfully deleted. A confirmation email has
            been sent to you.
          </p>
        ) : (
          <>
            <p>
              This will permanently remove all your personal data from KcalApp.
              This action cannot be undone.
            </p>

            {!showDeleteConfirm ? (
              <button onClick={() => setShowDeleteConfirm(true)}>
                Delete my account
              </button>
            ) : (
              <div>
                <p>
                  <strong>Are you sure?</strong> Your account and all associated
                  personal data will be permanently deleted.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                >
                  {deleteLoading
                    ? 'Deleting...'
                    : 'Yes, permanently delete my account'}
                </button>
                <button onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </button>
              </div>
            )}

            {deleteError && <p style={{ color: 'red' }}>{deleteError}</p>}
          </>
        )}
      </section>
    </main>
  );
}

export default GdprPage;
