import React, { useState } from 'react';
import {
  Sparkles,
  Shuffle,
  Clock,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  CheckSquare,
  Bookmark,
  Layers,
} from 'lucide-react';
import { ClutterItem, ItemCategory } from '../types';
import { calculateDaysSince } from '../utils/clutterScore';
import { ItemCard } from './ItemCard';

interface ForgottenTreasureViewProps {
  forgottenItems: ClutterItem[];
  thresholdDays: number;
  onOpenRescueModal: (item?: ClutterItem) => void;
  onToggleComplete: (id: string) => void;
  onVisit: (id: string) => void;
  onMarkReviewed: (id: string) => void;
  onChangeCategory: (id: string, category: ItemCategory) => void;
  onEdit: (item: ClutterItem) => void;
  onDelete: (id: string) => void;
}

export const ForgottenTreasureView: React.FC<ForgottenTreasureViewProps> = ({
  forgottenItems,
  thresholdDays,
  onOpenRescueModal,
  onToggleComplete,
  onVisit,
  onMarkReviewed,
  onChangeCategory,
  onEdit,
  onDelete,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | ItemCategory>('ALL');
  const [sortBy, setSortBy] = useState<'longest' | 'shortest' | 'title'>('longest');

  // Filter
  const filtered = forgottenItems.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    const daysA = calculateDaysSince(a.lastReviewedAt);
    const daysB = calculateDaysSince(b.lastReviewedAt);
    if (sortBy === 'longest') return daysB - daysA;
    if (sortBy === 'shortest') return daysA - daysB;
    return a.title.localeCompare(b.title);
  });

  // Average waiting days
  const avgDays =
    forgottenItems.length > 0
      ? Math.round(
          forgottenItems.reduce((acc, curr) => acc + calculateDaysSince(curr.lastReviewedAt), 0) /
            forgottenItems.length
        )
      : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Signature Feature Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 rounded-3xl p-6 md:p-8 text-white shadow-lg shadow-amber-900/10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold text-amber-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Signature Differentiator</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Forgotten Treasure Chest
            </h1>

            <p className="text-xs sm:text-sm text-amber-100 leading-relaxed max-w-xl">
              Items you saved with good intentions that haven't been reviewed for {thresholdDays}+ days.
              Rediscover hidden gems, finish neglected tasks, or let them go with confidence.
            </p>

            <div className="flex items-center gap-4 pt-2 text-xs font-medium text-amber-100/90 font-mono">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-300" />
                Avg wait: {avgDays} days
              </span>
              <span>·</span>
              <span>{forgottenItems.length} items awaiting rescue</span>
            </div>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <button
              onClick={() => onOpenRescueModal()}
              disabled={forgottenItems.length === 0}
              className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-xl transition-all ${
                forgottenItems.length > 0
                  ? 'bg-white text-amber-900 hover:bg-amber-50 active:scale-98 cursor-pointer'
                  : 'bg-white/40 text-white/70 cursor-not-allowed'
              }`}
            >
              <Shuffle className="w-4 h-4 text-amber-600" />
              <span>Rescue an Item (Randomizer)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Filter segmented tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-xl">
          {[
            { id: 'ALL', label: 'All Treasures' },
            { id: 'READ', label: 'Read Box' },
            { id: 'DO', label: 'Do Box' },
            { id: 'REFERENCE', label: 'Reference' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="longest">Most Neglected (Longest Wait)</option>
            <option value="shortest">Recently Neglected</option>
            <option value="title">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Grid of Forgotten Items */}
      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sorted.map((item) => (
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
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-md mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Zero Forgotten Items in this Box!
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            {selectedCategory !== 'ALL'
              ? `There are no forgotten items inside your ${selectedCategory} Box.`
              : `All your saved items have been reviewed within the past ${thresholdDays} days.`}
          </p>
          {selectedCategory !== 'ALL' && (
            <button
              onClick={() => setSelectedCategory('ALL')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View All Categories
            </button>
          )}
        </div>
      )}
    </div>
  );
};
