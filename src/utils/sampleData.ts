import { ClutterItem } from '../types';

function daysAgo(days: number, hoursOffset = 2): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hoursOffset);
  return d.toISOString();
}

export const INITIAL_SAMPLE_ITEMS: ClutterItem[] = [
  {
    id: 'sample-1',
    title: 'React 19 Server Actions, useOptimistic, and Simplified Forms',
    category: 'read',
    content_type: 'article',
    url: 'https://react.dev/reference/react',
    description: 'Essential review of React 19 architecture: action transitions, optimistic UI updates, and server function mechanics.',
    tags: ['react', 'frontend', 'javascript'],
    is_completed: false,
    is_archived: false,
    created_at: daysAgo(28),
    last_reviewed_at: daysAgo(22), // 22d -> Forgotten
    updated_at: daysAgo(22),
    is_sample: true,
  },
  {
    id: 'sample-2',
    title: 'Mastering SaaS Visual Design: Typography, Radius Math & Spacing',
    category: 'read',
    content_type: 'video',
    url: 'https://youtube.com/watch?v=sample-saas-design',
    description: 'Recommended video guide covering single-elevation depth, tabular figures, and anti-slop visual discipline.',
    tags: ['design', 'ui', 'video'],
    is_completed: false,
    is_archived: false,
    created_at: daysAgo(35),
    last_reviewed_at: daysAgo(19), // 19d -> Forgotten
    updated_at: daysAgo(19),
    is_sample: true,
  },
  {
    id: 'sample-3',
    title: 'Build personal developer portfolio with interactive live showcases',
    category: 'do',
    content_type: 'task',
    description: 'Milestones:\n1. Curate top 3 full-stack case studies\n2. Add live interactive component playground\n3. Verify WCAG AA accessibility contrast',
    tags: ['career', 'portfolio', 'priority'],
    is_completed: false,
    is_archived: false,
    created_at: daysAgo(42),
    last_reviewed_at: daysAgo(31), // 31d -> Forgotten DO task
    updated_at: daysAgo(31),
    is_sample: true,
  },
  {
    id: 'sample-4',
    title: 'Modern JavaScript & TypeScript Utility Patterns Cheat Sheet',
    category: 'reference',
    content_type: 'document',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
    description: 'Comprehensive snippets for structuredClone, debounce, Map groupBy, and Promise concurrency pool managers.',
    tags: ['javascript', 'reference', 'snippets'],
    is_completed: false,
    is_archived: false,
    created_at: daysAgo(50),
    last_reviewed_at: daysAgo(40), // 40d -> Forgotten Reference
    updated_at: daysAgo(40),
    is_sample: true,
  },
  {
    id: 'sample-5',
    title: 'Web Accessibility (a11y) WCAG 2.2 Quick Reference & Contrast Guidelines',
    category: 'read',
    content_type: 'article',
    url: 'https://www.w3.org/WAI/standards-guidelines/wcag/',
    description: 'Checklist for keyboard focus-visible outlines, 44px touch targets, and ARIA live notifications.',
    tags: ['accessibility', 'standards'],
    is_completed: false,
    is_archived: false,
    created_at: daysAgo(12),
    last_reviewed_at: daysAgo(3), // 3d -> Active
    updated_at: daysAgo(3),
    is_sample: true,
  },
  {
    id: 'sample-6',
    title: 'Audit and cancel unused SaaS trial subscriptions before auto-renewal',
    category: 'do',
    content_type: 'task',
    description: 'Check statements for unused cloud hosting tiers, trial domains, and redundant developer tool subscriptions.',
    tags: ['finance', 'declutter'],
    is_completed: false,
    is_archived: false,
    created_at: daysAgo(8),
    last_reviewed_at: daysAgo(2), // 2d -> Active DO task
    updated_at: daysAgo(2),
    is_sample: true,
  },
  {
    id: 'sample-7',
    title: 'CSS Grid & Flexbox Modern Layout Reference Guide',
    category: 'reference',
    content_type: 'link',
    url: 'https://css-tricks.com/snippets/css/complete-guide-grid/',
    description: 'Go-to cheat sheet for auto-fit vs auto-fill minmax grids, subgrids, and alignment formulas.',
    tags: ['css', 'layout', 'cheatsheet'],
    is_completed: false,
    is_archived: false,
    created_at: daysAgo(16),
    last_reviewed_at: daysAgo(4), // 4d -> Active Reference
    updated_at: daysAgo(4),
    is_sample: true,
  },
  {
    id: 'sample-8',
    title: 'Digital Minimalism & Cal Newport High-Quality Leisure Notes',
    category: 'read',
    content_type: 'article',
    url: 'https://www.calnewport.com/books/digital-minimalism/',
    description: 'Completed reading key chapter on reclaiming intentional focus and decluttering digital feeds.',
    tags: ['productivity', 'books'],
    is_completed: true,
    completed_at: daysAgo(5),
    is_archived: false,
    created_at: daysAgo(25),
    last_reviewed_at: daysAgo(5),
    updated_at: daysAgo(5),
    is_sample: true,
  },
];
