import { z } from 'zod';

export const ItemCategoryEnum = z.enum(['read', 'do', 'reference']);
export const ContentTypeEnum = z.enum([
  'link',
  'article',
  'video',
  'note',
  'task',
  'document',
  'idea',
  'other',
]);

// 15.1 Item Categorization Schemas
export const CategorizeRequestSchema = z.object({
  title: z.string().min(1).max(200),
  url: z.string().max(2048).optional(),
  description: z.string().max(20000).optional(),
  context: z.string().max(5000).optional(),
});

export const CategorizeResponseSchema = z.object({
  category: ItemCategoryEnum,
  contentType: ContentTypeEnum,
  summary: z.string().min(1),
  tags: z.array(z.string().max(40)).max(20),
  reason: z.string().min(1),
  nextAction: z.string().nullable().optional(),
});

// 15.2 Clutter Organization Recommendations Schemas
export const ClutterAssistantRequestSchema = z.object({
  activeItemsCount: z.number().int().nonnegative(),
  forgottenItemsCount: z.number().int().nonnegative(),
  completedItemsCount: z.number().int().nonnegative(),
  clutterScore: z.number().min(0).max(100),
  thresholdDays: z.number().int().positive().default(14),
  sampleItems: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        category: ItemCategoryEnum,
        contentType: ContentTypeEnum,
        daysNeglected: z.number().int().nonnegative(),
        isForgotten: z.boolean(),
        hasUrl: z.boolean(),
      })
    )
    .max(30),
});

export const ClutterAssistantResponseSchema = z.object({
  headline: z.string(),
  observations: z.array(
    z.object({
      message: z.string(),
      evidence: z.string(),
      action: z.string(),
    })
  ),
  suggestedActions: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      priority: z.enum(['low', 'medium', 'high']),
    })
  ),
});

export type CategorizeRequest = z.infer<typeof CategorizeRequestSchema>;
export type CategorizeResponse = z.infer<typeof CategorizeResponseSchema>;
export type ClutterAssistantRequest = z.infer<typeof ClutterAssistantRequestSchema>;
export type ClutterAssistantResponse = z.infer<typeof ClutterAssistantResponseSchema>;
