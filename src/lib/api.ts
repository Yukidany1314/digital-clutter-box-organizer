import { AICategorizationResult, AIAssistantRecommendation, ClutterItem } from '../types';

export async function checkServerHealth() {
  try {
    const res = await fetch('/api/v1/health');
    return await res.json();
  } catch (err) {
    return { success: false, error: err };
  }
}

export async function requestAICategorization(payload: {
  title: string;
  url?: string;
  description?: string;
  context?: string;
}): Promise<{ data: AICategorizationResult; isAiGenerated: boolean }> {
  const res = await fetch('/api/v1/ai/categorize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Failed to categorize item');
  }

  return {
    data: json.data,
    isAiGenerated: Boolean(json.meta?.isAiGenerated),
  };
}

export async function requestAIAssistantRecommendations(payload: {
  activeItemsCount: number;
  forgottenItemsCount: number;
  completedItemsCount: number;
  clutterScore: number;
  thresholdDays: number;
  sampleItems: Array<{
    id: string;
    title: string;
    category: string;
    contentType: string;
    daysNeglected: number;
    isForgotten: boolean;
    hasUrl: boolean;
  }>;
}): Promise<{ data: AIAssistantRecommendation; isAiGenerated: boolean }> {
  const res = await fetch('/api/v1/ai/assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Failed to fetch recommendations');
  }

  return {
    data: json.data,
    isAiGenerated: Boolean(json.meta?.isAiGenerated),
  };
}
