import { useState } from 'react';

import { useAuth, useCurrentUser } from '../auth/authContext';
import type { WeightEntry } from '../components/profile/api';
import { GdprSection } from '../components/profile/GdprSection';
import { GoalsCard } from '../components/profile/GoalsCard';
import { ProfileIdentityCard } from '../components/profile/ProfileIdentityCard';
import { WeightCard } from '../components/profile/WeightCard';

/** Profile page: identity, body composition, goals and account settings. */
export default function ProfilePage() {
  const user = useCurrentUser();
  const { updateUser } = useAuth();
  const [latestEntry, setLatestEntry] = useState<WeightEntry | null>();

  return (
    <div className="flex animate-fade-in-up flex-col gap-6">
      <h1 className="sr-only">Profil</h1>

      <ProfileIdentityCard user={user} onUpdate={updateUser} />

      <WeightCard
        userId={user.userId}
        height={user.height}
        onLatestEntry={setLatestEntry}
      />

      <GoalsCard user={user} latestEntry={latestEntry} />

      <GdprSection />
    </div>
  );
}
