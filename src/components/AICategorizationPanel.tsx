import React, { useState } from 'react';
import { Sparkles, Check, X, Loader2, ArrowRight, Lightbulb, AlertCircle } from 'lucide-react';
import { requestAICategorization } from '../lib/api';
import { AICategorizationResult, ItemCategory, ContentType } from '../types';

interface AICategorizationPanelProps {
  title: string;
  url?: string;
  description?: string;
  currentCategory: ItemCategory;
  onApply: (suggestions: {
    category: ItemCategory;
    contentType: ContentType;
    tags: string[];
    descriptionSummary?: string;
  }) => void;
}

export const AICategorizationPanel: React.FC<AICategorizationPanelProps> = ({
  title,
  url,
  description,
  currentCategory,
  onApply,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<AICategorizationResult | null>(null);
  const [isAiPowered, setIsAiPowered] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleRequestSuggestion = async () => {
    if (!title.trim()) {
      setError('Please provide a title before requesting AI organization.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await requestAICategorization({
        title: title.trim(),
        url: url?.trim() || undefined,
        description: description?.trim() || undefined,
      });

      setSuggestion(res.data);
      setIsAiPowered(res.isAiGenerated);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch suggestions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!suggestion) return;
    onApply({
      category: suggestion.category,
      contentType: suggestion.contentType,
      tags: suggestion.tags,
      descriptionSummary: !description ? suggestion.summary : undefined,
    });
    setSuggestion(null);
  };

  return (
    <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-2xl p-4 transition-all">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              AI Smart Categorization
            </h4>
            <p className="text-[11px] text-slate-500">
              Powered by Google Gemini — classifies intent, generates tags & next action.
            </p>
          </div>
        </div>

        {!suggestion && (
          <button
            type="button"
            onClick={handleRequestSuggestion}
            disabled={isLoading || !title.trim()}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isLoading || !title.trim()
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs active:scale-98'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Suggest Organization</span>
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Suggestion Preview Card */}
      {suggestion && (
        <div className="mt-3 pt-3 border-t border-indigo-200/60 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-indigo-900 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Proposed Organization ({isAiPowered ? 'Gemini 3.8 Flash' : 'Smart Rule Engine'})
            </span>
            <span className="text-[10px] font-mono text-indigo-600 bg-indigo-100/70 px-2 py-0.5 rounded">
              Needs your review
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-indigo-100 space-y-2 text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold block">Box</span>
                <span className="font-bold text-indigo-600 uppercase">
                  {suggestion.category} Box
                </span>
              </div>
              <span className="text-slate-200">|</span>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold block">Type</span>
                <span className="font-bold text-slate-800 capitalize">
                  {suggestion.contentType}
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold block">Summary</span>
              <p className="text-slate-600 leading-relaxed text-xs mt-0.5">
                {suggestion.summary}
              </p>
            </div>

            {suggestion.reason && (
              <p className="text-[11px] text-slate-500 italic">
                Reason: {suggestion.reason}
              </p>
            )}

            {suggestion.nextAction && (
              <div className="bg-amber-50/70 p-2 rounded-lg border border-amber-200/60 text-amber-900 text-[11px] flex items-center gap-1.5">
                <span className="font-semibold">Next Action:</span>
                <span>{suggestion.nextAction}</span>
              </div>
            )}

            {suggestion.tags && suggestion.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-slate-400 text-[11px]">Tags:</span>
                {suggestion.tags.map((t) => (
                  <span
                    key={t}
                    className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* User Review & Decision Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setSuggestion(null)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 hover:bg-white rounded-lg transition-colors"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Suggestions</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
