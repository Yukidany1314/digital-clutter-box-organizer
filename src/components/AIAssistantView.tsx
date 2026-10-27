import React, { useState } from 'react';
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  Layers,
  Clock,
  Lightbulb,
  AlertTriangle,
  RefreshCw,
  Compass,
} from 'lucide-react';
import { ClutterItem, AIAssistantRecommendation, ClutterScoreData } from '../types';
import { requestAIAssistantRecommendations } from '../lib/api';
import { calculateDaysSince } from '../utils/clutterScore';

interface AIAssistantViewProps {
  items: ClutterItem[];
  clutterScore: ClutterScoreData;
  thresholdDays: number;
  onOpenRescueModal: (item?: ClutterItem) => void;
  onNavigateTab: (tab: any) => void;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  items,
  clutterScore,
  thresholdDays,
  onOpenRescueModal,
  onNavigateTab,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<AIAssistantRecommendation | null>(null);
  const [isAiPowered, setIsAiPowered] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeItems = items.filter((i) => !i.is_archived && !i.is_completed);
  const forgottenItems = activeItems.filter(
    (i) => calculateDaysSince(i.last_reviewed_at || i.created_at) >= thresholdDays
  );

  const handleRunAnalysis = async () => {
    setIsLoading(true);
    setError(null);

    // Prepare bounded, sanitized payload of user items
    const sampleItems = activeItems.slice(0, 20).map((i) => ({
      id: i.id,
      title: i.title,
      category: i.category,
      contentType: i.content_type,
      daysNeglected: calculateDaysSince(i.last_reviewed_at || i.created_at),
      isForgotten: calculateDaysSince(i.last_reviewed_at || i.created_at) >= thresholdDays,
      hasUrl: Boolean(i.url),
    }));

    try {
      const res = await requestAIAssistantRecommendations({
        activeItemsCount: activeItems.length,
        forgottenItemsCount: forgottenItems.length,
        completedItemsCount: items.filter((i) => i.is_completed).length,
        clutterScore: clutterScore.score,
        thresholdDays,
        sampleItems,
      });

      setRecommendations(res.data);
      setIsAiPowered(res.isAiGenerated);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold text-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>AI Organization Engine</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              ClutterBox Assistant
            </h1>

            <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed max-w-xl">
              Analyzes your actual saved articles, tasks, and neglected timestamps using Google Gemini to provide grounded, actionable organization advice.
            </p>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <button
              onClick={handleRunAnalysis}
              disabled={isLoading}
              className="w-full md:w-auto px-5 py-3 rounded-2xl bg-white text-indigo-900 hover:bg-indigo-50 active:scale-98 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Analyzing Your Backlog...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Analyze My Digital Clutter</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Snapshot Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-medium text-slate-400 block mb-1">Clutter Score</span>
          <div className={`text-2xl font-bold font-mono tabular-nums ${clutterScore.colorClass}`}>
            {clutterScore.score}/100
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">{clutterScore.label}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-medium text-slate-400 block mb-1">Active Queue</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-800">
            {activeItems.length}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Unfinished items</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-medium text-slate-400 block mb-1">Forgotten Backlog</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-700">
            {forgottenItems.length}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">{thresholdDays}+ days untouched</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-medium text-slate-400 block mb-1">Completed</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700">
            {clutterScore.completedItems}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Finished & archived</span>
        </div>
      </div>

      {/* Results View */}
      {recommendations ? (
        <div className="space-y-6">
          {/* Headline Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold mb-1">
                <Lightbulb className="w-4 h-4" />
                <span>Executive Summary ({isAiPowered ? 'Gemini 3.8 Flash' : 'Rule Engine Fallback'})</span>
              </div>
              <h2 className="text-base font-bold text-slate-900">{recommendations.headline}</h2>
            </div>

            <button
              onClick={handleRunAnalysis}
              disabled={isLoading}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors"
              title="Refresh analysis"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Observations */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Grounded Observations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.observations.map((obs, idx) => (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2"
                >
                  <p className="text-xs font-semibold text-slate-900 leading-snug">{obs.message}</p>
                  <div className="text-[11px] font-mono text-indigo-600 bg-indigo-50/70 px-2 py-0.5 rounded-md inline-block">
                    Evidence: {obs.evidence}
                  </div>
                  <p className="text-xs text-slate-600 pt-1 border-t border-slate-100">
                    <strong className="text-slate-800">Recommended action:</strong> {obs.action}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Actions */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Immediate High-Impact Actions
            </h3>
            <div className="space-y-3">
              {recommendations.suggestedActions.map((action, idx) => {
                let badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
                if (action.priority === 'high') {
                  badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
                } else if (action.priority === 'medium') {
                  badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
                }

                return (
                  <div
                    key={idx}
                    className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${badgeColor}`}>
                          {action.priority} Priority
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">{action.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500">{action.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      {forgottenItems.length > 0 && (
                        <button
                          onClick={() => onOpenRescueModal()}
                          className="px-3.5 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>Rescue Item</span>
                        </button>
                      )}
                      <button
                        onClick={() => onNavigateTab('items')}
                        className="px-3.5 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-xl transition-colors flex items-center gap-1"
                      >
                        <span>Browse Queue</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-md mx-auto my-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Ready to Inspect Your Clutter
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-5">
            Click the button above to run an AI-powered diagnostic across your saved articles, tasks, and forgotten treasures.
          </p>
          <button
            onClick={handleRunAnalysis}
            disabled={isLoading}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start Analysis</span>
          </button>
        </div>
      )}
    </div>
  );
};
