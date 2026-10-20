import type { ActivityItem } from './types';

/**
 * Keeps only the most recent activity of each friend; the feed comes sorted
 * newest first.
 */
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
