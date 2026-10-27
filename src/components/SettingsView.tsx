import React, { useRef } from 'react';
import {
  Settings as SettingsIcon,
  RotateCcw,
  Trash2,
  Download,
  Upload,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { AppSettings, ClutterItem } from '../types';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onResetSample: () => void;
  onClearAll: () => void;
  onExport: () => void;
  onImport: (jsonString: string) => boolean;
  totalItems: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetSample,
  onClearAll,
  onExport,
  onImport,
  totalItems,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImport(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Settings & Data Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Customize forgotten threshold, backup your data, or reset sample demo items.
        </p>
      </div>

      {/* Threshold Setting */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Forgotten Treasure Inactivity Threshold
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Items not reviewed for this many days are automatically flagged as Forgotten Treasures.
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-lg font-mono font-bold text-amber-600 tabular-nums">
              {settings.forgottenThresholdDays} days
            </span>
          </div>
        </div>

        {/* Quick select pills */}
        <div className="grid grid-cols-4 gap-2 pt-2">
          {[7, 14, 21, 30].map((days) => {
            const isSelected = settings.forgottenThresholdDays === days;
            return (
              <button
                key={days}
                onClick={() => onUpdateSettings({ forgottenThresholdDays: days })}
                className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                {days} Days {days === 14 ? '(Default)' : ''}
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Feedback Setting */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Celebratory Confetti</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Show subtle confetti animations when rescuing forgotten treasures or clearing tasks.
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enableConfetti}
            onChange={(e) => onUpdateSettings({ enableConfetti: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>

      {/* Backup & Restore */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Data Persistence & Backups</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            All your data is saved automatically in your browser's LocalStorage ({totalItems} items currently saved).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Export JSON */}
          <button
            onClick={onExport}
            className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 text-left transition-all flex items-start gap-3 group"
          >
            <Download className="w-5 h-5 text-slate-500 mt-0.5 group-hover:text-indigo-600 transition-colors" />
            <div>
              <div className="text-xs font-bold text-slate-800">Export Backup (JSON)</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Download a complete copy of all your saved items and metadata.
              </div>
            </div>
          </button>

          {/* Import JSON */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 text-left transition-all flex items-start gap-3 group"
            >
              <Upload className="w-5 h-5 text-slate-500 mt-0.5 group-hover:text-indigo-600 transition-colors" />
              <div>
                <div className="text-xs font-bold text-slate-800">Import Backup (JSON)</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Restore previously exported items from a JSON file.
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Demo & Reset Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Demo & Reset Tools</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Useful for hackathon demos or starting completely fresh.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          {/* Reset Demo Data */}
          <button
            onClick={onResetSample}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100/70 text-indigo-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restore 8 Demo Items</span>
          </button>

          {/* Clear All */}
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete all saved items? This cannot be undone.')) {
                onClearAll();
              }
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100/70 text-rose-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>

      {/* Demo Checklist Card */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>2-Minute Hackathon Demo Script</span>
        </div>
        <ol className="text-xs text-slate-600 space-y-1.5 list-decimal pl-4 leading-relaxed">
          <li><strong>View Summary:</strong> Observe the 5 KPI cards and transparent Clutter Score.</li>
          <li><strong>Quick Capture:</strong> Click "+ Quick Capture" to add a new link or note.</li>
          <li><strong>Search & Filter:</strong> Type keywords in search or filter by Read, Do, or Reference.</li>
          <li><strong>Move Box:</strong> Use the card dropdown to move an item from Read to Do.</li>
          <li><strong>Forgotten Treasure:</strong> Highlight items marked with "neglected 14+ days".</li>
          <li><strong>Rescue an Item:</strong> Click "Rescue an Item" to trigger the shuffle & decision modal.</li>
          <li><strong>Complete & Celebrate:</strong> Mark an item complete and observe the score drop.</li>
          <li><strong>Refresh & Persist:</strong> Reload page to confirm all state stays intact via LocalStorage.</li>
        </ol>
      </div>
    </div>
  );
};
