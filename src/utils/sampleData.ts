import { ClutterItem } from '../types';

/**
 * Helper to compute an ISO date string offset by a number of days in the past.
 */
function daysAgo(days: number, hoursOffset = 2): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hoursOffset);
  return d.toISOString();
}

export const INITIAL_SAMPLE_ITEMS: ClutterItem[] = [
  {
    id: 'sample-1',
    title: 'Learn React 19 Actions, useOptimistic, and Server Functions',
    type: 'article',
    category: 'READ',
    url: 'https://react.dev/reference/react',
    note: 'Key concepts to master: useActionState, optimistic updates in UI, and simplified form handling.',
    tags: ['React', 'Frontend', 'WebDev'],
    createdAt: daysAgo(28),
    lastReviewedAt: daysAgo(22), // 22 days ago -> Forgotten!
    isCompleted: false,
    isSample: true,
    estimatedMinutes: 15,
  },
  {
    id: 'sample-2',
    title: 'Watch UI Design Masterclass: Hierarchy, Spacing & Micro-Interactions',
    type: 'video',
    category: 'READ',
    url: 'https://www.youtube.com/watch?v=sample-ui-mastery',
    note: 'Recommended by Sarah. Check timestamp 14:20 for grid alignment formulas and nested border-radius rules.',
    tags: ['Design', 'UX', 'Video'],
    createdAt: daysAgo(35),
    lastReviewedAt: daysAgo(19), // 19 days ago -> Forgotten!
    isCompleted: false,
    isSample: true,
    estimatedMinutes: 25,
  },
  {
    id: 'sample-3',
    title: 'Build personal portfolio with interactive project showcase and live demos',
    type: 'note',
    category: 'DO',
    note: 'Action items:\n1. Curate top 3 full-stack case studies\n2. Add live interactive component playgrounds\n3. Test mobile responsive drawer and keyboard navigation',
    tags: ['Career', 'Portfolio', 'Priority'],
    createdAt: daysAgo(42),
    lastReviewedAt: daysAgo(31), // 31 days ago -> Long Forgotten!
    isCompleted: false,
    isSample: true,
    estimatedMinutes: 60,
  },
  {
    id: 'sample-4',
    title: 'Modern JavaScript & TypeScript Utility Patterns Cheat Sheet',
    type: 'link',
    category: 'REFERENCE',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
    note: 'Essential reference for deep-clone, structuredClone, debounce, groupBy, and Promise concurrency wrappers.',
    tags: ['JavaScript', 'Reference', 'Snippets'],
    createdAt: daysAgo(50),
    lastReviewedAt: daysAgo(40), // 40 days ago -> Forgotten!
    isCompleted: false,
    isSample: true,
    estimatedMinutes: 10,
  },
  {
    id: 'sample-5',
    title: 'Web Accessibility (a11y) WCAG 2.2 Quick Reference & Contrast Checker',
    type: 'article',
    category: 'READ',
    url: 'https://www.w3.org/WAI/standards-guidelines/wcag/',
    note: 'Review minimum touch target size (44x44px) and focus-visible keyboard outlines for modals.',
    tags: ['Accessibility', 'a11y', 'Standards'],
    createdAt: daysAgo(12),
    lastReviewedAt: daysAgo(3), // 3 days ago -> Active!
    isCompleted: false,
    isSample: true,
    estimatedMinutes: 12,
  },
  {
    id: 'sample-6',
    title: 'Audit and cancel unused SaaS trial subscriptions before renewal dates',
    type: 'note',
    category: 'DO',
    note: 'Check card statements for domain autorenewals, cloud storage tiers, and streaming services not used this quarter.',
    tags: ['Finance', 'Declutter', 'Chores'],
    createdAt: daysAgo(8),
    lastReviewedAt: daysAgo(2), // 2 days ago -> Active!
    isCompleted: false,
    isSample: true,
    estimatedMinutes: 20,
  },
  {
    id: 'sample-7',
    title: 'CSS Grid & Modern Flexbox Visual Layout Reference Guide',
    type: 'link',
    category: 'REFERENCE',
    url: 'https://css-tricks.com/snippets/css/complete-guide-grid/',
    note: 'Go-to reference for auto-fit vs auto-fill minmax repeat expressions and subgrid properties.',
    tags: ['CSS', 'Layout', 'Reference'],
    createdAt: daysAgo(16),
    lastReviewedAt: daysAgo(5), // 5 days ago -> Active!
    isCompleted: false,
    isSample: true,
    estimatedMinutes: 5,
  },
  {
    id: 'sample-8',
    title: 'Digital Minimalism & The Attention Economy by Cal Newport',
    type: 'article',
    category: 'READ',
    url: 'https://www.calnewport.com/books/digital-minimalism/',
    note: 'Finished reading chapter on high-quality leisure. Great insights on decluttering digital feeds!',
    tags: ['Productivity', 'Books', 'Mindset'],
    createdAt: daysAgo(25),
    lastReviewedAt: daysAgo(6),
    isCompleted: true,
    completedAt: daysAgo(6),
    isSample: true,
    estimatedMinutes: 30,
  },
];
