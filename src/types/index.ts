export type ItemCategory = 'read' | 'do' | 'reference';

export type ContentType =
  | 'link'
  | 'article'
  | 'video'
  | 'note'
  | 'task'
  | 'document'
  | 'idea'
  | 'other';

export interface ClutterItem {
  id: string;
  user_id?: string;
  title: string;
  url?: string;
  description?: string;
  category: ItemCategory;
  content_type: ContentType;
  tags: string[];
  is_completed: boolean;
  completed_at?: string;
  is_archived: boolean;
  archived_at?: string;
  created_at: string;
  updated_at: string;
  last_reviewed_at?: string;
  is_sample?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export interface UserSettings {
  forgottenThresholdDays: number;
  enableConfetti: boolean;
  compactView: boolean;
}

export interface ClutterScoreData {
  score: number;
  label: 'Well Organized' | 'Light Clutter' | 'Needs Attention' | 'High Clutter';
  description: string;
  colorClass: string;
  bgLightClass: string;
  borderClass: string;
  totalItems: number;
  activeItems: number;
  attentionItems: number;
  forgottenItems: number;
  completedItems: number;
  archivedItems: number;
  suggestedAction: string;
}

export interface AICategorizationResult {
  category: ItemCategory;
  contentType: ContentType;
  summary: string;
  tags: string[];
  reason: string;
  nextAction?: string | null;
}

export interface AIAssistantRecommendation {
  headline: string;
  observations: Array<{
    message: string;
    evidence: string;
    action: string;
  }>;
  suggestedActions: Array<{
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
  }>;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'info' | 'warning' | 'error';
}
