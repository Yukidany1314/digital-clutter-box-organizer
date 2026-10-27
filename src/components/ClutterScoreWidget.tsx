import React, { useState } from 'react';
import { ClutterScoreData } from '../types';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

interface ClutterScoreWidgetProps {
  scoreData: ClutterScoreData;
  thresholdDays: number;
  onOpenRescueModal: () => void;
}

export const ClutterScoreWidget: React.FC<ClutterScoreWidgetProps> = ({
  scoreData,
  thresholdDays,
  onOpenRescueModal,
}) => {
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);

  // SVG circular ring calculations
  const size = 110;
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scoreData.score / 100) * circumference;

  let ringColor = '#10b981'; // emerald
  if (scoreData.score > 75) {
    ringColor = '#f43f5e'; // rose
  } else if (scoreData.score > 45) {
    ringColor = '#f59e0b'; // amber
  } else if (scoreData.score > 20) {
    ringColor = '#3b82f6'; // blue
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
      <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
        {/* Left: Circular Ring & Score */}
        <div className="flex items-center gap-5">
          <div className="relative shrink-0 flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
              {/* Background circle track */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#F1F5F9"
                strokeWidth={strokeWidth}
              />
              {/* Colored progress circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={ringColor}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
                {scoreData.score}
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                / 100
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-base font-bold ${scoreData.colorClass}`}>
                {scoreData.label}
              </span>
              <button
                onClick={() => setShowFormulaDetails(!showFormulaDetails)}
                className="text-slate-400 hover:text-slate-700 p-0.5 rounded-full"
                title="Explain Clutter Score formula"
                aria-label="Explain Clutter Score formula"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
              {scoreData.description}
            </p>
            <div className="mt-2 text-[11px] text-slate-400 font-medium">
              Formula: round(100 × attentionItems / activeItems) · {scoreData.attentionItems} need focus
            </div>
          </div>
        </div>

        {/* Right: Summary metrics + Rescue trigger */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
          <div className="grid grid-cols-3 gap-3 w-full sm:w-auto text-center">
            <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-100">
              <span className="block text-[11px] text-slate-400 font-medium">Active</span>
              <span className="text-sm font-bold font-mono text-slate-800 tabular-nums">
                {scoreData.activeItems}
              </span>
            </div>
            <div className="bg-amber-50/80 px-3.5 py-2 rounded-xl border border-amber-100">
              <span className="block text-[11px] text-amber-700 font-medium">Attention</span>
              <span className="text-sm font-bold font-mono text-amber-800 tabular-nums">
                {scoreData.attentionItems}
              </span>
            </div>
            <div className="bg-emerald-50/80 px-3.5 py-2 rounded-xl border border-emerald-100">
              <span className="block text-[11px] text-emerald-700 font-medium">Done</span>
              <span className="text-sm font-bold font-mono text-emerald-800 tabular-nums">
                {scoreData.completedItems}
              </span>
            </div>
          </div>

          {scoreData.forgottenItems > 0 && (
            <button
              onClick={onOpenRescueModal}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs hover:from-amber-600 hover:to-amber-700 active:scale-98 transition-all shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>Rescue an Item</span>
            </button>
          )}
        </div>
      </div>

      {/* Expandable Transparent Formula Explanation */}
      {showFormulaDetails && (
        <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-600">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-indigo-500" />
                Transparent Clutter Score Breakdown
              </h4>
              <button
                onClick={() => setShowFormulaDetails(false)}
                className="text-xs text-slate-400 hover:text-slate-700"
              >
                Close
              </button>
            </div>

            <p className="text-slate-500 text-xs leading-relaxed">
              ClutterBox defines the Clutter Score as the exact proportion of active items requiring attention:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-white rounded-lg border border-slate-200/60">
                <div className="text-[11px] font-semibold text-slate-700 mb-1">
                  1. Attention Items ({scoreData.attentionItems})
                </div>
                <div className="text-xs text-slate-500">
                  Active items that either belong to the <strong>DO Box</strong> (actionable tasks) or have been neglected for <strong>{thresholdDays}+ days</strong> without review.
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200/60">
                <div className="text-[11px] font-semibold text-slate-700 mb-1">
                  2. Active Backlog ({scoreData.activeItems})
                </div>
                <div className="text-xs text-slate-500">
                  Total uncompleted, unarchived records currently in your repository.
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/60">
              <span>
                Calculation: round(100 × {scoreData.attentionItems} / {scoreData.activeItems || 1}) = <strong className="text-slate-800">{scoreData.score}/100 points ({scoreData.label})</strong>
              </span>
              <span className="text-indigo-600 font-medium">100% deterministic</span>
            </div>

            <div className="text-[11px] text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200/60">
              <strong>Suggested Action:</strong> {scoreData.suggestedAction}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
