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
  const [exportData, setExportData] = useState<ExportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hardcoded to user 1 for now — will be replaced with real auth later
  const userId = 1;

  async function handleExport() {
    setLoading(true);
    setError(null);

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
      setError('Could not retrieve your data. Please try again.');
    } finally {
      setLoading(false);
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

  return (
    <main>
      <h1>My Personal Data</h1>
      <p>
        In accordance with GDPR, you can view and download a copy of all the
        personal data we hold about you.
      </p>

      <button onClick={handleExport} disabled={loading}>
        {loading ? 'Loading...' : 'View my data'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

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
    </main>
  );
}

export default GdprPage;
