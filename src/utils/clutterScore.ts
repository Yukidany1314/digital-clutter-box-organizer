import { ClutterItem, ClutterScoreData } from '../types';

export function calculateDaysSince(isoDateString: string): number {
  try {
    const timestamp = Date.parse(isoDateString);
    if (isNaN(timestamp)) return 0;
    const diffMs = Date.now() - timestamp;
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  } catch {
    return 0;
  }
}

export function isItemForgotten(item: ClutterItem, thresholdDays = 14): boolean {
  if (item.isCompleted) return false;
  const days = calculateDaysSince(item.lastReviewedAt);
  return days >= thresholdDays;
}

export function calculateClutterScore(
  items: ClutterItem[],
  thresholdDays = 14
): ClutterScoreData {
  const totalItems = items.length;
  const completedItems = items.filter((i) => i.isCompleted).length;
  const activeItems = totalItems - completedItems;
  const forgottenItems = items.filter((i) => isItemForgotten(i, thresholdDays)).length;

  if (totalItems === 0) {
    return {
      score: 0,
      label: 'Zero Clutter',
      description: 'Your digital space is completely clean and ready for fresh ideas.',
      colorClass: 'text-emerald-600',
      bgLightClass: 'bg-emerald-50',
      borderClass: 'border-emerald-200',
      totalItems: 0,
      activeItems: 0,
      forgottenItems: 0,
      completedItems: 0,
      activeRate: 0,
      forgottenRate: 0,
    };
  }

  if (activeItems === 0) {
    return {
      score: 0,
      label: 'Zen Master',
      description: 'Everything is organized and completed. Your digital space is light!',
      colorClass: 'text-emerald-600',
      bgLightClass: 'bg-emerald-50',
      borderClass: 'border-emerald-200',
      totalItems,
      activeItems: 0,
      forgottenItems: 0,
      completedItems,
      activeRate: 0,
      forgottenRate: 0,
    };
  }

  // Transparent calculation:
  // 40% weight on proportion of uncompleted items
  // 60% weight on proportion of active items that have been neglected (forgotten >= threshold days)
  const activeRate = activeItems / totalItems;
  const forgottenRate = forgottenItems / activeItems;

  const rawScore = (activeRate * 40) + (forgottenRate * 60);
  const score = Math.min(100, Math.max(5, Math.round(rawScore)));

  let label = 'Low Clutter';
  let description = 'Your digital space is getting lighter! Most saved items are fresh.';
  let colorClass = 'text-emerald-600';
  let bgLightClass = 'bg-emerald-50';
  let borderClass = 'border-emerald-200';

  if (score > 75) {
    label = 'High Clutter';
    description = 'Multiple items are gathering dust. Try "Rescue an Item" to rediscover treasures!';
    colorClass = 'text-rose-600';
    bgLightClass = 'bg-rose-50';
    borderClass = 'border-rose-200';
  } else if (score > 45) {
    label = 'Moderate Clutter';
    description = 'A few saved items have been sitting unread. A quick review will lighten the load.';
    colorClass = 'text-amber-600';
    bgLightClass = 'bg-amber-50';
    borderClass = 'border-amber-200';
  } else if (score > 25) {
    label = 'Manageable';
    description = 'Good balance! You are keeping up with your saved articles and tasks.';
    colorClass = 'text-blue-600';
    bgLightClass = 'bg-blue-50';
    borderClass = 'border-blue-200';
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
    forgottenItems,
    completedItems,
    activeRate: Math.round(activeRate * 100),
    forgottenRate: Math.round(forgottenRate * 100),
  };
}
