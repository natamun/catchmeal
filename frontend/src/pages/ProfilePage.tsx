import { useState } from 'react';

import { useAuth, useCurrentUser } from '../auth/authContext';
import { GdprSection } from '../components/profile/GdprSection';
import { GoalsCard } from '../components/profile/GoalsCard';
import { ProfileIdentityCard } from '../components/profile/ProfileIdentityCard';
import { WeightCard } from '../components/profile/WeightCard';

/** Profile page: identity, body composition, goals and account settings. */
export default function ProfilePage() {
  const user = useCurrentUser();
  const { updateUser } = useAuth();
  const [latestWeight, setLatestWeight] = useState<number | null>();

  return (
    <div className="flex animate-fade-in-up flex-col gap-6">
      <h1 className="sr-only">Profil</h1>

      <ProfileIdentityCard user={user} onUpdate={updateUser} />

      <WeightCard
        userId={user.userId}
        height={user.height}
        onLatestWeight={setLatestWeight}
      />

      <GoalsCard user={user} latestWeight={latestWeight} />

      <GdprSection />
    </div>
  );
}
