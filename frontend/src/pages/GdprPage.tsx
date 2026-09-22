import { useState } from 'react';

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
  data: {
    profile: UserProfile;
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

      const data = (await response.json()) as ExportResponse;
      setExportData(data);
    } catch {
      setExportError('Could not retrieve your data. Please try again.');
    } finally {
      setExportLoading(false);
    }
  }

  function handleDownload() {
    if (!exportData) return;

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

  const profile = exportData?.data.profile;

  return (
    <main>
      <h1>My Personal Data</h1>
      <p>
        In accordance with GDPR, you can view and download a copy of all the
        personal data we hold about you.
      </p>

      {/* --- Data export section --- */}
      <button onClick={() => void handleExport()} disabled={exportLoading}>
        {exportLoading ? 'Loading...' : 'View my data'}
      </button>

      {exportError && <p style={{ color: 'red' }}>{exportError}</p>}

      {exportData && profile && (
        <section>
          <h2>Your data</h2>
          <p>
            <strong>Exported at:</strong> {exportData.exportedAt}
          </p>

          <h3>Profile</h3>
          <ul>
            <li>
              <strong>ID:</strong> {profile.id}
            </li>
            <li>
              <strong>Username:</strong> {profile.username}
            </li>
            <li>
              <strong>Name:</strong> {profile.name}
            </li>
            <li>
              <strong>Email:</strong> {profile.email}
            </li>
            <li>
              <strong>Role:</strong> {profile.role}
            </li>
            <li>
              <strong>Member since:</strong>{' '}
              {new Date(profile.createAt).toLocaleDateString()}
            </li>
          </ul>

          <h3>Meals logged: {profile.meal.length}</h3>
          <h3>Weight entries: {profile.weightLogs.length}</h3>
          <h3>Goal settings: {profile.goalSettings.length}</h3>
          <h3>Messages sent: {profile.senderMessage.length}</h3>
          <h3>Messages received: {profile.receiverMessage.length}</h3>

          <button onClick={handleDownload}>Download full data as JSON</button>
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
                  onClick={() => void handleDeleteAccount()}
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
