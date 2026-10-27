import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  X,
  Plus,
  BookOpen,
  CheckSquare,
  Bookmark,
  Sparkles,
  Layers,
  CheckCircle2,
  Globe,
  Video,
  FileText,
} from 'lucide-react';
import { ClutterItem, ItemCategory, ItemType, SortOption, ViewTab } from '../types';
import { calculateDaysSince, isItemForgotten } from '../utils/clutterScore';
import { ItemCard } from './ItemCard';

interface ItemsListViewProps {
  currentTab: ViewTab;
  items: ClutterItem[];
  thresholdDays: number;
  initialSearch?: string;
  onOpenAddModal: () => void;
  onOpenRescueModal: (item?: ClutterItem) => void;
  onToggleComplete: (id: string) => void;
  onVisit: (id: string) => void;
  onMarkReviewed: (id: string) => void;
  onChangeCategory: (id: string, category: ItemCategory) => void;
  onEdit: (item: ClutterItem) => void;
  onDelete: (id: string) => void;
}

export const ItemsListView: React.FC<ItemsListViewProps> = ({
  currentTab,
  items,
  thresholdDays,
  initialSearch = '',
  onOpenAddModal,
  onOpenRescueModal,
  onToggleComplete,
  onVisit,
  onMarkReviewed,
  onChangeCategory,
  onEdit,
  onDelete,
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [selectedType, setSelectedType] = useState<'ALL' | ItemType>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ACTIVE' | 'FORGOTTEN' | 'COMPLETED'>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Category context based on current tab
  const tabCategoryFilter = useMemo((): ItemCategory | 'ALL' => {
    if (currentTab === 'read') return 'READ';
    if (currentTab === 'do') return 'DO';
    if (currentTab === 'reference') return 'REFERENCE';
    return 'ALL';
  }, [currentTab]);

  const isCompletedTab = currentTab === 'completed';

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Completed tab restriction
      if (isCompletedTab && !item.isCompleted) return false;
      if (!isCompletedTab && currentTab !== 'all' && item.isCompleted && selectedStatus !== 'COMPLETED') {
        // If not on all or completed tab, by default hide completed unless explicitly filtered
        return false;
      }

      // Tab category filter
      if (tabCategoryFilter !== 'ALL' && item.category !== tabCategoryFilter) {
        return false;
      }

      // Type filter
      if (selectedType !== 'ALL' && item.type !== selectedType) {
        return false;
      }

      // Status filter
      if (selectedStatus === 'ACTIVE' && item.isCompleted) return false;
      if (selectedStatus === 'COMPLETED' && !item.isCompleted) return false;
      if (selectedStatus === 'FORGOTTEN' && !isItemForgotten(item, thresholdDays)) return false;

      // Text search
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchUrl = item.url?.toLowerCase().includes(query) || false;
        const matchNote = item.note?.toLowerCase().includes(query) || false;
        const matchTags = item.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchTitle && !matchUrl && !matchNote && !matchTags) return false;
      }

      return true;
    });
  }, [items, currentTab, isCompletedTab, tabCategoryFilter, selectedType, selectedStatus, search, thresholdDays]);

  // Sort items
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      if (sortBy === 'newest') {
        return Date.parse(b.createdAt) - Date.parse(a.createdAt);
      }
      if (sortBy === 'oldest') {
        return Date.parse(a.createdAt) - Date.parse(b.createdAt);
      }
      if (sortBy === 'most_forgotten') {
        const waitA = calculateDaysSince(a.lastReviewedAt);
        const waitB = calculateDaysSince(b.lastReviewedAt);
        return waitB - waitA;
      }
      if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [filteredItems, sortBy]);

  // Has active filters?
  const hasActiveFilters =
    search.trim() !== '' ||
    selectedType !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    sortBy !== 'newest';

  const clearAllFilters = () => {
    setSearch('');
    setSelectedType('ALL');
    setSelectedStatus('ALL');
    setSortBy('newest');
  };

  // Header copy helper
  const getHeaderInfo = () => {
    switch (currentTab) {
      case 'read':
        return {
          title: 'READ Box',
          subtitle: 'Articles, blogs, guides, and tutorials queued for reading.',
          icon: BookOpen,
          color: 'text-indigo-600',
        };
      case 'do':
        return {
          title: 'DO Box',
          subtitle: 'Actionable tasks, coding ideas, and portfolio milestones requiring focus.',
          icon: CheckSquare,
          color: 'text-emerald-600',
        };
      case 'reference':
        return {
          title: 'REFERENCE Box',
          subtitle: 'Cheat sheets, documentations, code patterns, and durable resources.',
          icon: Bookmark,
          color: 'text-sky-600',
        };
      case 'completed':
        return {
          title: 'Completed Items',
          subtitle: 'Articles finished, tasks achieved, and clutter conquered.',
          icon: CheckCircle2,
          color: 'text-slate-700',
        };
      case 'all':
      default:
        return {
          title: 'All Saved Items',
          subtitle: 'Full repository across all Smart Boxes with live search & multi-filters.',
          icon: Layers,
          color: 'text-slate-800',
        };
    }
  };

  const headerInfo = getHeaderInfo();
  const HeaderIcon = headerInfo.icon;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* View Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-700 shadow-xs">
            <HeaderIcon className={`w-5 h-5 ${headerInfo.color}`} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {headerInfo.title}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">{headerInfo.subtitle}</p>
          </div>
        </div>

        <button
          onClick={onOpenAddModal}
          className="self-start sm:self-auto px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Item</span>
        </button>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, url, notes, or tags..."
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder:text-slate-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most_forgotten">Most Forgotten (Longest Wait)</option>
              <option value="alphabetical">Alphabetical (A-Z)</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Badges Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Type Segmented Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-xl">
            {[
              { id: 'ALL', label: 'All Types' },
              { id: 'link', label: 'Links' },
              { id: 'article', label: 'Articles' },
              { id: 'video', label: 'Videos' },
              { id: 'note', label: 'Notes' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id as any)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                  selectedType === t.id
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Status Filter (if not on completed view) */}
          {!isCompletedTab && (
            <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-xl">
              {[
                { id: 'ALL', label: 'All Status' },
                { id: 'ACTIVE', label: 'Active' },
                { id: 'FORGOTTEN', label: 'Forgotten' },
                { id: 'COMPLETED', label: 'Completed' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStatus(s.id as any)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                    selectedStatus === s.id
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          <div className="text-[11px] font-mono text-slate-400">
            Showing <strong className="text-slate-700">{sortedItems.length}</strong> items
          </div>
        </div>
      </div>

      {/* Item Cards Grid */}
      {sortedItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              thresholdDays={thresholdDays}
              onToggleComplete={onToggleComplete}
              onVisit={onVisit}
              onMarkReviewed={onMarkReviewed}
              onChangeCategory={onChangeCategory}
              onEdit={onEdit}
              onDelete={onDelete}
              onRescueSingle={() => onOpenRescueModal(item)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            No matching items found
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-5">
            {hasActiveFilters
              ? 'Try relaxing your search terms or clearing current filter selections.'
              : `You haven't saved any items in this box yet. Click below to add one!`}
          </p>

          <div className="flex items-center justify-center gap-2.5">
            {hasActiveFilters ? (
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Reset Filters
              </button>
            ) : (
              <button
                onClick={onOpenAddModal}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Save First Item</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
