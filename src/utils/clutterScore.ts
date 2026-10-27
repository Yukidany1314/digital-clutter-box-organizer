import { ClutterItem, ClutterScoreData } from '../types';

export function calculateDaysSince(isoDateString?: string): number {
  if (!isoDateString) return 0;
  try {
    const timestamp = Date.parse(isoDateString);
    if (isNaN(timestamp)) return 0;
    const diffMs = Date.now() - timestamp;
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  } catch {
    return 0;
  }
}

/**
 * An item is forgotten when it is active (not completed, not archived)
 * and its last_reviewed_at (or created_at) is >= thresholdDays ago.
 */
export function isItemForgotten(item: ClutterItem, thresholdDays = 14): boolean {
  if (item.is_completed || item.is_archived) return false;
  const reviewTime = item.last_reviewed_at || item.created_at;
  const days = calculateDaysSince(reviewTime);
  return days >= thresholdDays;
}

/**
 * An active item requires attention when it is incomplete and either:
 * 1. It is in the DO category; or
 * 2. It has been neglected for at least thresholdDays.
 */
export function requiresAttention(item: ClutterItem, thresholdDays = 14): boolean {
  if (item.is_completed || item.is_archived) return false;
  if (item.category === 'do') return true;
  return isItemForgotten(item, thresholdDays);
}

/**
 * Clutter Score = round(100 * attentionItems / activeItems)
 * If no active items, score is 0.
 */
export function calculateClutterScore(
  items: ClutterItem[],
  thresholdDays = 14
): ClutterScoreData {
  const totalItems = items.length;
  const archivedItems = items.filter((i) => i.is_archived).length;
  const unarchived = items.filter((i) => !i.is_archived);
  const completedItems = unarchived.filter((i) => i.is_completed).length;
  const activeItemsList = unarchived.filter((i) => !i.is_completed);
  const activeItems = activeItemsList.length;

  const forgottenItemsList = activeItemsList.filter((i) => isItemForgotten(i, thresholdDays));
  const forgottenItems = forgottenItemsList.length;

  const attentionList = activeItemsList.filter((i) => requiresAttention(i, thresholdDays));
  const attentionItems = attentionList.length;

  if (activeItems === 0) {
    return {
      score: 0,
      label: 'Well Organized',
      description: 'Zero active clutter items. Your repository is tidy and up to date.',
      colorClass: 'text-emerald-600',
      bgLightClass: 'bg-emerald-50',
      borderClass: 'border-emerald-200',
      totalItems,
      activeItems: 0,
      attentionItems: 0,
      forgottenItems: 0,
      completedItems,
      archivedItems,
      suggestedAction: 'Capture new articles or ideas when inspiration strikes.',
    };
  }

  // Exact formula from specification: round(100 * attentionItems / activeItems)
  const score = Math.round((100 * attentionItems) / activeItems);

  let label: ClutterScoreData['label'] = 'Well Organized';
  let description = 'Most saved content is fresh and under control.';
  let colorClass = 'text-emerald-600';
  let bgLightClass = 'bg-emerald-50';
  let borderClass = 'border-emerald-200';
  let suggestedAction = 'Keep up the steady habit of reviewing items.';

  if (score >= 75) {
    label = 'High Clutter';
    description = 'A large portion of active items are overdue tasks or forgotten treasures.';
    colorClass = 'text-rose-600';
    bgLightClass = 'bg-rose-50';
    borderClass = 'border-rose-200';
    suggestedAction = 'Rescue 2 forgotten items today or complete pending DO tasks.';
  } else if (score >= 50) {
    label = 'Needs Attention';
    description = 'Clutter is accumulating. Several items need quick review or action.';
    colorClass = 'text-amber-600';
    bgLightClass = 'bg-amber-50';
    borderClass = 'border-amber-200';
    suggestedAction = 'Browse your DO Box or Forgotten Treasures to declutter.';
  } else if (score >= 25) {
    label = 'Light Clutter';
    description = 'A manageable queue of active tasks and reading material.';
    colorClass = 'text-blue-600';
    bgLightClass = 'bg-blue-50';
    borderClass = 'border-blue-200';
    suggestedAction = 'Dedicate 10 minutes to reading through your saved articles.';
  }

  return {
    score,
    label,
    description,
    colorClass,
    bgLightClass,
    borderClass,
    totalItems,
    activeItems,
    attentionItems,
    forgottenItems,
    completedItems,
    archivedItems,
    suggestedAction,
  };
}
