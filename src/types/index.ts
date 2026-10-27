export type ItemCategory = 'READ' | 'DO' | 'REFERENCE';

export type ItemType = 'link' | 'article' | 'video' | 'note';

export interface ClutterItem {
  id: string;
  title: string;
  type: ItemType;
  category: ItemCategory;
  url?: string;
  note?: string;
  tags: string[];
  createdAt: string; // ISO string
  lastReviewedAt: string; // ISO string
  isCompleted: boolean;
  completedAt?: string; // ISO string
  isSample?: boolean;
  estimatedMinutes?: number;
}

export type ViewTab =
  | 'dashboard'
  | 'all'
  | 'read'
  | 'do'
  | 'reference'
  | 'forgotten'
  | 'completed'
  | 'settings';

export type SortOption = 'newest' | 'oldest' | 'most_forgotten' | 'alphabetical';

export interface FilterState {
  search: string;
  category: 'ALL' | ItemCategory;
  type: 'ALL' | ItemType;
  sortBy: SortOption;
  onlyForgotten: boolean;
}

export interface AppSettings {
  forgottenThresholdDays: number;
  enableConfetti: boolean;
  compactView: boolean;
}

export interface ClutterScoreData {
  score: number;
  label: string;
  description: string;
  colorClass: string;
  bgLightClass: string;
  borderClass: string;
  totalItems: number;
  activeItems: number;
  forgottenItems: number;
  completedItems: number;
  activeRate: number;
  forgottenRate: number;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'info' | 'warning' | 'error';
}
