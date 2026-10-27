import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  Shuffle,
  ExternalLink,
  CheckCircle2,
  Bookmark,
  Trash2,
  Clock,
  ArrowRight,
  Globe,
  BookOpen,
  Video,
  FileText,
  Archive,
} from 'lucide-react';
import { ClutterItem } from '../types';
import { calculateDaysSince } from '../utils/clutterScore';

interface RescueModalProps {
  isOpen: boolean;
  onClose: () => void;
  forgottenItems: ClutterItem[];
  thresholdDays: number;
  initialItem?: ClutterItem | null;
  onRescueAction: (
    id: string,
    action: 'revisit' | 'complete' | 'reference' | 'archive' | 'delete'
  ) => void;
}

export const RescueModal: React.FC<RescueModalProps> = ({
  isOpen,
  onClose,
  forgottenItems,
  thresholdDays,
  initialItem,
  onRescueAction,
}) => {
  const [selectedItem, setSelectedItem] = useState<ClutterItem | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (initialItem && forgottenItems.some((i) => i.id === initialItem.id)) {
      setSelectedItem(initialItem);
    } else if (forgottenItems.length > 0) {
      const randIndex = Math.floor(Math.random() * forgottenItems.length);
      setSelectedItem(forgottenItems[randIndex]);
    } else {
      setSelectedItem(null);
    }
  }, [isOpen, initialItem, forgottenItems]);

  if (!isOpen) return null;

  const handleShuffle = () => {
    if (forgottenItems.length <= 1) return;
    setIsShuffling(true);
    setTimeout(() => {
      const candidates = forgottenItems.filter((i) => i.id !== selectedItem?.id);
      const next = candidates[Math.floor(Math.random() * candidates.length)] || forgottenItems[0];
      setSelectedItem(next);
      setIsShuffling(false);
    }, 200);
  };

  const handleAction = (action: 'revisit' | 'complete' | 'reference' | 'archive' | 'delete') => {
    if (!selectedItem) return;
    onRescueAction(selectedItem.id, action);

    const remaining = forgottenItems.filter((i) => i.id !== selectedItem.id);
    if (remaining.length > 0) {
      setSelectedItem(remaining[0]);
    } else {
      onClose();
    }
  };

  const reviewDate = selectedItem ? selectedItem.last_reviewed_at || selectedItem.created_at : '';
  const daysWaiting = calculateDaysSince(reviewDate);

  const renderTypeIcon = () => {
    if (!selectedItem) return null;
    switch (selectedItem.content_type) {
      case 'video':
        return <Video className="w-4 h-4 text-rose-500" />;
      case 'article':
        return <BookOpen className="w-4 h-4 text-indigo-500" />;
      case 'note':
        return <FileText className="w-4 h-4 text-emerald-500" />;
      case 'task':
        return <CheckCircle2 className="w-4 h-4 text-amber-500" />;
      case 'link':
      default:
        return <Globe className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-amber-200/90 shadow-2xl overflow-hidden transform transition-all">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-100" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Rescue a Forgotten Treasure</h2>
              <p className="text-[11px] text-amber-100/90 font-medium">
                {forgottenItems.length} {forgottenItems.length === 1 ? 'item' : 'items'} neglected for {thresholdDays}+ days
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {forgottenItems.length > 1 && (
              <button
                onClick={handleShuffle}
                disabled={isShuffling}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1 text-xs"
                title="Shuffle another random treasure"
              >
                <Shuffle className={`w-3.5 h-3.5 ${isShuffling ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Shuffle</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {selectedItem ? (
          <div className="p-6">
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 text-xs mb-4">
              <span className="flex items-center gap-1.5 text-amber-900 font-semibold">
                <Clock className="w-4 h-4 text-amber-600" />
                Neglected for <span className="font-mono tabular-nums">{daysWaiting} days</span>
              </span>
              <span className="text-amber-700 text-[11px]">
                Threshold: {thresholdDays} days
              </span>
            </div>

            <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 mb-5">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1.5">
                <span className="flex items-center gap-1">
                  {renderTypeIcon()}
                  <span className="capitalize">{selectedItem.content_type}</span>
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="font-semibold text-indigo-600 uppercase">
                  {selectedItem.category} Box
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {selectedItem.title}
              </h3>

              {selectedItem.url && (
                <div className="mt-1.5">
                  <span className="text-xs text-indigo-600 truncate font-mono block max-w-full">
                    {selectedItem.url}
                  </span>
                </div>
              )}

              {selectedItem.description && (
                <p className="mt-2 text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100 whitespace-pre-line leading-relaxed">
                  {selectedItem.description}
                </p>
              )}

              {selectedItem.tags && selectedItem.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {selectedItem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200/60"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Choose a rescue action:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={() => handleAction('revisit')}
                  className="p-3 text-left bg-white hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-xl transition-all group"
                >
                  <div className="flex items-center justify-between text-indigo-600 font-semibold text-xs mb-1">
                    <span className="flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Revisit & Read Now
                    </span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Opens URL, updates review date, resets forgotten timer.
                  </p>
                </button>

                <button
                  onClick={() => handleAction('complete')}
                  className="p-3 text-left bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all group"
                >
                  <div className="flex items-center justify-between text-emerald-600 font-semibold text-xs mb-1">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark as Done
                    </span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Cross it off your digital queue with celebration!
                  </p>
                </button>

                <button
                  onClick={() => handleAction('reference')}
                  className="p-3 text-left bg-white hover:bg-sky-50/50 border border-slate-200 hover:border-sky-300 rounded-xl transition-all group"
                >
                  <div className="flex items-center justify-between text-sky-600 font-semibold text-xs mb-1">
                    <span className="flex items-center gap-1.5">
                      <Bookmark className="w-3.5 h-3.5" />
                      Keep in Reference
                    </span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Move to REFERENCE Box as a permanent resource.
                  </p>
                </button>

                <button
                  onClick={() => handleAction('archive')}
                  className="p-3 text-left bg-white hover:bg-purple-50/50 border border-slate-200 hover:border-purple-300 rounded-xl transition-all group"
                >
                  <div className="flex items-center justify-between text-purple-600 font-semibold text-xs mb-1">
                    <span className="flex items-center gap-1.5">
                      <Archive className="w-3.5 h-3.5" />
                      Move to Archive
                    </span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Safely archive without permanently deleting.
                  </p>
                </button>

                <button
                  onClick={() => handleAction('delete')}
                  className="p-3 text-left bg-white hover:bg-rose-50/50 border border-slate-200 hover:border-rose-300 rounded-xl transition-all group sm:col-span-2"
                >
                  <div className="flex items-center justify-between text-rose-600 font-semibold text-xs mb-1">
                    <span className="flex items-center gap-1.5">
                      <Trash2 className="w-3.5 h-3.5" />
                      Let Go & Delete Permanently
                    </span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    If this no longer sparks interest, purge it to lighten your Clutter Score.
                  </p>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              All Forgotten Treasures Rescued!
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mb-5 leading-relaxed">
              No items in your ClutterBox have been neglected for more than {thresholdDays} days. Your digital space is clean and fresh!
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
