import React, { useRef, useState } from 'react';
import {
  Settings as SettingsIcon,
  RotateCcw,
  Trash2,
  Download,
  Upload,
  Clock,
  Sparkles,
  User,
  ShieldCheck,
  CheckCircle2,
  Database,
} from 'lucide-react';
import { UserSettings } from '../types';
import { useAuth } from '../context/AuthContext';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
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
  const { user, isDemoMode, isCloudConfigured, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [profileSaved, setProfileSaved] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    await updateProfile(displayName.trim());
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) onImport(content);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Settings & Account
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your account profile, forgotten threshold, and backup preferences.
        </p>
      </div>

      {/* Account Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Account Profile</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isDemoMode ? 'Demo Session Profile (Alex Rivera)' : user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-mono px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 ${
                isCloudConfigured
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}
            >
              <Database className="w-3 h-3" />
              <span>{isCloudConfigured ? 'Supabase Connected' : 'Local High-Fidelity DB'}</span>
            </span>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
            />
          </div>
          <button
            type="submit"
            className="self-end px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors mt-auto"
          >
            {profileSaved ? 'Saved!' : 'Update Name'}
          </button>
        </form>
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
                Items not reviewed for this many days trigger Forgotten Treasure status and weight in your Clutter Score.
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-lg font-mono font-bold text-amber-600 tabular-nums">
              {settings.forgottenThresholdDays} days
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 pt-2">
          {[7, 14, 30, 60].map((days) => {
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

      {/* Confetti Setting */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Celebration Confetti</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Subtle visual confetti burst on rescuing items or completing tasks.
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
          <h2 className="text-sm font-bold text-slate-900">Data Backups & Export</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Export or import your saved items and metadata ({totalItems} items currently saved).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={onExport}
            className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 text-left transition-all flex items-start gap-3 group"
          >
            <Download className="w-5 h-5 text-slate-500 mt-0.5 group-hover:text-indigo-600 transition-colors" />
            <div>
              <div className="text-xs font-bold text-slate-800">Export Backup (JSON)</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Download a clean JSON archive of your saved collection.
              </div>
            </div>
          </button>

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
                  Restore previously exported records from a JSON file.
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Demo & Reset Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Demo Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Reset to realistic sample items for quick hackathon demonstrations.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <button
            onClick={onResetSample}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100/70 text-indigo-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restore 8 Sample Items</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Delete all saved items? This cannot be undone.')) {
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
    </div>
  );
};
