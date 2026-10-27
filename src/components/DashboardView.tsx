import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  BookOpen,
  CheckSquare,
  Sparkles,
  CheckCircle2,
  Bookmark,
  Plus,
  ArrowRight,
  Clock,
  Bot,
} from 'lucide-react';
import { ClutterItem, ClutterScoreData, ItemCategory } from '../types';
import { ClutterScoreWidget } from './ClutterScoreWidget';
import { ItemCard } from './ItemCard';

interface DashboardViewProps {
  items: ClutterItem[];
  clutterScore: ClutterScoreData;
  forgottenItems: ClutterItem[];
  thresholdDays: number;
  onOpenAddModal: () => void;
  onOpenRescueModal: (item?: ClutterItem) => void;
  onToggleComplete: (id: string) => void;
  onVisit: (id: string) => void;
  onMarkReviewed: (id: string) => void;
  onChangeCategory: (id: string, category: ItemCategory) => void;
  onArchive: (id: string) => void;
  onEdit: (item: ClutterItem) => void;
  onDelete: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  items,
  clutterScore,
  forgottenItems,
  thresholdDays,
  onOpenAddModal,
  onOpenRescueModal,
  onToggleComplete,
  onVisit,
  onMarkReviewed,
  onChangeCategory,
  onArchive,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();

  const unarchived = items.filter((i) => !i.is_archived);
  const totalCount = unarchived.length;
  const readCount = unarchived.filter((i) => i.category === 'read' && !i.is_completed).length;
  const doCount = unarchived.filter((i) => i.category === 'do' && !i.is_completed).length;
  const referenceCount = unarchived.filter((i) => i.category === 'reference' && !i.is_completed).length;
  const completedCount = unarchived.filter((i) => i.is_completed).length;

  const recentItems = [...unarchived]
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
    .slice(0, 4);

  const spotlightTreasure = forgottenItems.length > 0 ? forgottenItems[0] : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome to ClutterBox
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Save less mentally. Organize better. Rediscover what matters.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/app/assistant')}
            className="px-3.5 py-2 text-xs font-semibold text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200/80 rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Bot className="w-3.5 h-3.5 text-purple-600" />
            <span>AI Assistant</span>
          </button>

          {forgottenItems.length > 0 && (
            <button
              onClick={() => onOpenRescueModal()}
              className="px-3.5 py-2 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300/70 rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Rescue Forgotten Item</span>
            </button>
          )}

          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Quick Capture</span>
          </button>
        </div>
      </div>

      {/* 5 Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div
          onClick={() => navigate('/app/items')}
          className="cursor-pointer bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Items</span>
            <Layers className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
            {totalCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Active repository</div>
        </div>

        <div
          onClick={() => navigate('/app/read')}
          className="cursor-pointer bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">To Read</span>
            <BookOpen className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-indigo-600 tabular-nums">
            {readCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Articles & videos</div>
        </div>

        <div
          onClick={() => navigate('/app/do')}
          className="cursor-pointer bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-200 transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">To Do</span>
            <CheckSquare className="w-4 h-4 text-emerald-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-emerald-600 tabular-nums">
            {doCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Pending actions</div>
        </div>

        <div
          onClick={() => navigate('/app/forgotten')}
          className="cursor-pointer bg-amber-50/60 p-4 rounded-2xl border border-amber-200 shadow-xs hover:border-amber-300 transition-all group"
        >
          <div className="flex items-center justify-between text-amber-800 mb-2">
            <span className="text-xs font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Forgotten Items
            </span>
            <Clock className="w-4 h-4 text-amber-500 group-hover:text-amber-700 transition-colors" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-amber-800 tabular-nums">
            {forgottenItems.length}
          </div>
          <div className="text-[11px] text-amber-700/80 mt-1">{thresholdDays}+ days neglected</div>
        </div>

        <div
          onClick={() => navigate('/app/completed')}
          className="cursor-pointer bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-200 transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover:text-emerald-600 transition-colors" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-slate-800 tabular-nums">
            {completedCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Done & archived</div>
        </div>
      </div>

      {/* Clutter Score Widget */}
      <ClutterScoreWidget
        scoreData={clutterScore}
        thresholdDays={thresholdDays}
        onOpenRescueModal={() => onOpenRescueModal()}
      />

      {/* Signature Feature: Spotlight Banner */}
      {spotlightTreasure ? (
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-amber-100/50 to-orange-50 rounded-3xl border border-amber-200/90 p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
                <span className="flex items-center gap-1.5 bg-amber-200/60 text-amber-900 px-2.5 py-0.5 rounded-full">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Forgotten Treasure Spotlight
                </span>
                <span>·</span>
                <span>{forgottenItems.length} items awaiting your rescue</span>
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                "{spotlightTreasure.title}"
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                Saved in your <strong className="text-slate-800 uppercase">{spotlightTreasure.category} Box</strong> and sitting unreviewed.
                {spotlightTreasure.description ? ` Note: "${spotlightTreasure.description.slice(0, 90)}..."` : ''}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => onOpenRescueModal(spotlightTreasure)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Rescue This Item</span>
              </button>

              <button
                onClick={() => navigate('/app/forgotten')}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-amber-50/80 border border-amber-300 text-amber-900 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View All ({forgottenItems.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50/60 rounded-3xl border border-emerald-200/70 p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                No Forgotten Treasures Right Now
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every saved item has been touched within the last {thresholdDays} days. Great job staying on top of your reading queue!
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/app/items')}
            className="hidden sm:flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            <span>Browse All Items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Smart Boxes Breakdown */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your Smart Boxes</h2>
            <p className="text-xs text-slate-400">
              Classified by purpose: Read, Do, or Keep for reference.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => navigate('/app/read')}
            className="cursor-pointer bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-indigo-300 shadow-xs transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono font-bold text-indigo-600 tabular-nums">
                {readCount} active
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              READ Box
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Articles, blogs, tutorials, and videos to explore when you have focused study time.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-indigo-600">
              <span>Explore Read Box</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => navigate('/app/do')}
            className="cursor-pointer bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-300 shadow-xs transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckSquare className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 tabular-nums">
                {doCount} active
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              DO Box
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Actionable tasks, project ideas, portfolio milestones, and activities to complete.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-emerald-600">
              <span>Explore Do Box</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => navigate('/app/reference')}
            className="cursor-pointer bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-sky-300 shadow-xs transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Bookmark className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono font-bold text-sky-600 tabular-nums">
                {referenceCount} active
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
              REFERENCE Box
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Cheat sheets, documentation, code snippets, and resources to retain for quick lookup.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-sky-600">
              <span>Explore Reference</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Items Section */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recently Saved Items</h2>
            <p className="text-xs text-slate-400">
              Latest items captured into your ClutterBox.
            </p>
          </div>
          <button
            onClick={() => navigate('/app/items')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View All ({totalCount})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {recentItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                thresholdDays={thresholdDays}
                onToggleComplete={onToggleComplete}
                onVisit={onVisit}
                onMarkReviewed={onMarkReviewed}
                onChangeCategory={onChangeCategory}
                onArchive={onArchive}
                onEdit={onEdit}
                onDelete={onDelete}
                onRescueSingle={() => onOpenRescueModal(item)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center">
            <p className="text-xs text-slate-500 mb-3">
              No saved items yet.
            </p>
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Capture First Item
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
