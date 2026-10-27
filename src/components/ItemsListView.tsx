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
  Layers,
  CheckCircle2,
  Archive,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ClutterItem, ItemCategory, ContentType } from '../types';
import { calculateDaysSince, isItemForgotten } from '../utils/clutterScore';
import { ItemCard } from './ItemCard';

interface ItemsListViewProps {
  viewMode: 'all' | 'read' | 'do' | 'reference' | 'completed' | 'archived';
  items: ClutterItem[];
  thresholdDays: number;
  initialSearch?: string;
  onOpenAddModal: () => void;
  onOpenRescueModal: (item?: ClutterItem) => void;
  onToggleComplete: (id: string) => void;
  onVisit: (id: string) => void;
  onMarkReviewed: (id: string) => void;
  onChangeCategory: (id: string, category: ItemCategory) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onEdit: (item: ClutterItem) => void;
  onDelete: (id: string) => void;
}

export const ItemsListView: React.FC<ItemsListViewProps> = ({
  viewMode,
  items,
  thresholdDays,
  initialSearch = '',
  onOpenAddModal,
  onOpenRescueModal,
  onToggleComplete,
  onVisit,
  onMarkReviewed,
  onChangeCategory,
  onArchive,
  onRestore,
  onEdit,
  onDelete,
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [selectedType, setSelectedType] = useState<'ALL' | ContentType>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ACTIVE' | 'FORGOTTEN' | 'COMPLETED'>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most_forgotten' | 'alphabetical'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Header info based on view mode
  const getHeaderInfo = () => {
    switch (viewMode) {
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
          subtitle: 'Actionable tasks, coding exercises, and portfolio milestones requiring focus.',
          icon: CheckSquare,
          color: 'text-emerald-600',
        };
      case 'reference':
        return {
          title: 'REFERENCE Box',
          subtitle: 'Cheat sheets, documentation, code patterns, and durable resources.',
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
      case 'archived':
        return {
          title: 'Archived Items',
          subtitle: 'Preserved records excluded from active clutter scores.',
          icon: Archive,
          color: 'text-purple-600',
        };
      case 'all':
      default:
        return {
          title: 'All Saved Items',
          subtitle: 'Full repository across all Smart Boxes with search & multi-filters.',
          icon: Layers,
          color: 'text-slate-800',
        };
    }
  };

  const headerInfo = getHeaderInfo();
  const HeaderIcon = headerInfo.icon;

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Archive isolation
      if (viewMode === 'archived') {
        if (!item.is_archived) return false;
      } else {
        if (item.is_archived) return false;
      }

      // Completed tab restriction
      if (viewMode === 'completed' && !item.is_completed) return false;
      if (viewMode !== 'all' && viewMode !== 'completed' && viewMode !== 'archived' && item.is_completed && selectedStatus !== 'COMPLETED') {
        return false;
      }

      // Box category
      if (viewMode === 'read' && item.category !== 'read') return false;
      if (viewMode === 'do' && item.category !== 'do') return false;
      if (viewMode === 'reference' && item.category !== 'reference') return false;

      // Type filter
      if (selectedType !== 'ALL' && item.content_type !== selectedType) return false;

      // Status filter
      if (selectedStatus === 'ACTIVE' && item.is_completed) return false;
      if (selectedStatus === 'COMPLETED' && !item.is_completed) return false;
      if (selectedStatus === 'FORGOTTEN' && !isItemForgotten(item, thresholdDays)) return false;

      // Text search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchUrl = item.url?.toLowerCase().includes(q) || false;
        const matchDesc = item.description?.toLowerCase().includes(q) || false;
        const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchUrl && !matchDesc && !matchTags) return false;
      }

      return true;
    });
  }, [items, viewMode, selectedType, selectedStatus, search, thresholdDays]);

  // Sort items
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      if (sortBy === 'newest') return Date.parse(b.created_at) - Date.parse(a.created_at);
      if (sortBy === 'oldest') return Date.parse(a.created_at) - Date.parse(b.created_at);
      if (sortBy === 'most_forgotten') {
        const waitA = calculateDaysSince(a.last_reviewed_at || a.created_at);
        const waitB = calculateDaysSince(b.last_reviewed_at || b.created_at);
        return waitB - waitA;
      }
      if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
      return 0;
    });
  }, [filteredItems, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedItems.length / pageSize) || 1;
  const paginatedItems = sortedItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title Banner */}
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

        {viewMode !== 'archived' && (
          <button
            onClick={onOpenAddModal}
            className="self-start sm:self-auto px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Item</span>
          </button>
        )}
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
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by title, url, notes, or tags..."
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 text-slate-800 placeholder:text-slate-400"
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
              onChange={(e) => setSortBy(e.target.value as any)}
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
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Badges Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Content Type Filter */}
          <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-xl">
            {[
              { id: 'ALL', label: 'All Types' },
              { id: 'article', label: 'Articles' },
              { id: 'video', label: 'Videos' },
              { id: 'task', label: 'Tasks' },
              { id: 'note', label: 'Notes' },
              { id: 'document', label: 'Docs' },
              { id: 'link', label: 'Links' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedType(t.id as any);
                  setCurrentPage(1);
                }}
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

          {/* Status Filter */}
          {viewMode !== 'completed' && viewMode !== 'archived' && (
            <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-xl">
              {[
                { id: 'ALL', label: 'All Status' },
                { id: 'ACTIVE', label: 'Active' },
                { id: 'FORGOTTEN', label: 'Forgotten' },
                { id: 'COMPLETED', label: 'Completed' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedStatus(s.id as any);
                    setCurrentPage(1);
                  }}
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
      {paginatedItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              thresholdDays={thresholdDays}
              onToggleComplete={onToggleComplete}
              onVisit={onVisit}
              onMarkReviewed={onMarkReviewed}
              onChangeCategory={onChangeCategory}
              onArchive={onArchive}
              onRestore={onRestore}
              onEdit={onEdit}
              onDelete={onDelete}
              onRescueSingle={() => onOpenRescueModal(item)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            No matching items found
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-5">
            {hasActiveFilters
              ? 'Try relaxing your search terms or clearing your filter selections.'
              : `You haven't saved any items in this view yet.`}
          </p>

          <div className="flex items-center justify-center gap-2.5">
            {hasActiveFilters ? (
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Reset Filters
              </button>
            ) : viewMode !== 'archived' && (
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 text-xs">
          <span className="text-slate-500 font-mono">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-xl border border-slate-200 ${
                currentPage === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-50'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-xl border border-slate-200 ${
                currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-50'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
