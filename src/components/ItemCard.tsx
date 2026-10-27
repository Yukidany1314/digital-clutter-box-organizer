import React, { useState } from 'react';
import {
  ExternalLink,
  CheckCircle2,
  Circle,
  MoreVertical,
  Clock,
  Sparkles,
  Edit2,
  Trash2,
  FileText,
  Video,
  Globe,
  BookOpen,
  ArrowRightLeft,
  Calendar,
  Eye,
} from 'lucide-react';
import { ClutterItem, ItemCategory } from '../types';
import { calculateDaysSince, isItemForgotten } from '../utils/clutterScore';

interface ItemCardProps {
  item: ClutterItem;
  thresholdDays: number;
  onToggleComplete: (id: string) => void;
  onVisit: (id: string) => void;
  onMarkReviewed: (id: string) => void;
  onChangeCategory: (id: string, category: ItemCategory) => void;
  onEdit: (item: ClutterItem) => void;
  onDelete: (id: string) => void;
  onRescueSingle?: (item: ClutterItem) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  thresholdDays,
  onToggleComplete,
  onVisit,
  onMarkReviewed,
  onChangeCategory,
  onEdit,
  onDelete,
  onRescueSingle,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const forgotten = isItemForgotten(item, thresholdDays);
  const daysWaiting = calculateDaysSince(item.lastReviewedAt);
  const daysSinceCreated = calculateDaysSince(item.createdAt);

  // Type Icon
  const renderTypeIcon = () => {
    switch (item.type) {
      case 'video':
        return <Video className="w-3.5 h-3.5 text-rose-500" />;
      case 'article':
        return <BookOpen className="w-3.5 h-3.5 text-indigo-500" />;
      case 'note':
        return <FileText className="w-3.5 h-3.5 text-emerald-500" />;
      case 'link':
      default:
        return <Globe className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  const getCategoryLabel = (cat: ItemCategory) => {
    switch (cat) {
      case 'READ':
        return 'Read Box';
      case 'DO':
        return 'Do Box';
      case 'REFERENCE':
        return 'Reference Box';
    }
  };

  const getDomainFromUrl = (urlStr?: string) => {
    if (!urlStr) return null;
    try {
      const url = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
      return url.hostname.replace(/^www\./, '');
    } catch {
      return urlStr.slice(0, 25);
    }
  };

  return (
    <div
      className={`group relative bg-white rounded-2xl border transition-all duration-200 p-5 ${
        item.isCompleted
          ? 'border-slate-200/60 bg-slate-50/40 opacity-75'
          : forgotten
          ? 'border-amber-200/90 shadow-xs shadow-amber-500/5 hover:border-amber-300'
          : 'border-slate-200/80 shadow-xs hover:border-indigo-200 hover:shadow-md'
      }`}
    >
      {/* Top Header: Unboxed Metadata & Category switcher */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        {/* Unboxed metadata line with typographic bullet separators */}
        <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5 text-slate-700">
            {renderTypeIcon()}
            <span className="capitalize">{item.type}</span>
          </span>

          <span aria-hidden="true" className="text-slate-300">·</span>

          <span className={`font-semibold ${
            item.category === 'READ'
              ? 'text-indigo-600'
              : item.category === 'DO'
              ? 'text-emerald-600'
              : 'text-sky-600'
          }`}>
            {getCategoryLabel(item.category)}
          </span>

          {forgotten && (
            <>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-amber-700 font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-500" />
                <span className="tabular-nums font-mono">{daysWaiting}d</span> neglected
              </span>
            </>
          )}

          {item.isSample && (
            <>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-[11px] text-slate-400 font-mono">Sample</span>
            </>
          )}
        </div>

        {/* Action controls */}
        <div className="relative shrink-0 flex items-center gap-1">
          {forgotten && onRescueSingle && !item.isCompleted && (
            <button
              onClick={() => onRescueSingle(item)}
              title="Rescue this forgotten treasure"
              className="px-2.5 py-1 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>Rescue</span>
            </button>
          )}

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Item actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Context Dropdown Menu */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-8 z-40 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 text-xs">
                <button
                  onClick={() => {
                    onEdit(item);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                  Edit Item
                </button>

                <button
                  onClick={() => {
                    onMarkReviewed(item.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  Mark Reviewed Today
                </button>

                <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-t border-slate-100 mt-1">
                  Move Box
                </div>

                {(['READ', 'DO', 'REFERENCE'] as ItemCategory[]).map((cat) => (
                  <button
                    key={cat}
                    disabled={item.category === cat}
                    onClick={() => {
                      onChangeCategory(item.id, cat);
                      setShowMenu(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left flex items-center gap-2 ${
                      item.category === cat
                        ? 'text-slate-300 cursor-default'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <ArrowRightLeft className="w-3 h-3 opacity-60" />
                    Move to {getCategoryLabel(cat)}
                  </button>
                ))}

                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={() => {
                      onDelete(item.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    Delete Item
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex items-start gap-3">
        {/* Toggle complete button */}
        <button
          onClick={() => onToggleComplete(item.id)}
          className="mt-0.5 shrink-0 text-slate-400 hover:text-indigo-600 transition-colors"
          title={item.isCompleted ? 'Mark uncompleted' : 'Mark completed'}
          aria-label={item.isCompleted ? 'Mark uncompleted' : 'Mark completed'}
        >
          {item.isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <Circle className="w-5 h-5 hover:text-indigo-600 text-slate-300 stroke-[1.8]" />
          )}
        </button>

        {/* Title & Body */}
        <div className="flex-1 min-w-0">
          <h3
            className={`text-sm font-semibold text-slate-900 leading-snug break-words ${
              item.isCompleted ? 'line-through text-slate-400' : ''
            }`}
          >
            {item.title}
          </h3>

          {/* URL domain link */}
          {item.url && (
            <div className="mt-1">
              <button
                onClick={() => onVisit(item.id)}
                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 hover:underline max-w-full truncate font-medium"
              >
                <Globe className="w-3 h-3 shrink-0" />
                <span className="truncate">{getDomainFromUrl(item.url)}</span>
                <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-70" />
              </button>
            </div>
          )}

          {/* Note excerpt */}
          {item.note && (
            <p className="mt-2 text-xs text-slate-600 leading-relaxed whitespace-pre-line line-clamp-3 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
              {item.note}
            </p>
          )}

          {/* Tags (clean subtle text) */}
          {item.tags && item.tags.length > 0 && (
            <div className="mt-3 flex items-center flex-wrap gap-1.5">
              {item.tags.map((t) => (
                <span
                  key={t}
                  className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Info & Quick Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span>Added {daysSinceCreated === 0 ? 'today' : `${daysSinceCreated}d ago`}</span>
          <span aria-hidden="true">·</span>
          <span>
            {daysWaiting === 0 ? 'Reviewed today' : `Last checked ${daysWaiting}d ago`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {item.url ? (
            <button
              onClick={() => onVisit(item.id)}
              className="text-xs font-medium text-slate-600 hover:text-indigo-600 flex items-center gap-1 transition-colors"
            >
              <span>Visit Link</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={() => onMarkReviewed(item.id)}
              className="text-xs font-medium text-slate-600 hover:text-indigo-600 flex items-center gap-1 transition-colors"
            >
              <span>Touch / Review</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
