import type { ActivityItem } from '../components/friends/types';

export function latestActivityPerFriend(
  activities: ActivityItem[],
): ActivityItem[] {
  const seen = new Set<number>();
  return activities.filter((activity) => {
    if (seen.has(activity.user.id)) return false;
    seen.add(activity.user.id);
    return true;
  });
}
