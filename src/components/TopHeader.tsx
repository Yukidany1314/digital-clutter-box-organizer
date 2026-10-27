import React from 'react';
import { Menu, Plus, Search, Sparkles, Filter } from 'lucide-react';
import { ViewTab } from '../types';

interface TopHeaderProps {
  currentTab: ViewTab;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAddModal: () => void;
  onOpenRescueModal: () => void;
  onOpenMobileMenu: () => void;
  forgottenCount: number;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentTab,
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onOpenRescueModal,
  onOpenMobileMenu,
  forgottenCount,
}) => {
  const getTabTitle = (tab: ViewTab) => {
    switch (tab) {
      case 'dashboard':
        return 'Dashboard Overview';
      case 'all':
        return 'All Saved Items';
      case 'read':
        return 'Read Box (Articles & Videos)';
      case 'do':
        return 'Do Box (Actionable Tasks)';
      case 'reference':
        return 'Reference Box (Docs & Tools)';
      case 'forgotten':
        return 'Forgotten Treasure Backlog';
      case 'completed':
        return 'Completed Archive';
      case 'settings':
        return 'Settings & Preferences';
      default:
        return 'Workspace';
    }
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur-xs border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Zone 1: Mobile toggle & Breadcrumb Title */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>ClutterBox</span>
            <span>/</span>
            <span className="font-semibold text-slate-800">{getTabTitle(currentTab)}</span>
          </nav>
        </div>
      </div>

      {/* Zone 2: Quick Search Bar */}
      <div className="flex-1 max-w-md mx-auto">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search items by title, notes, or URL..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {forgottenCount > 0 && currentTab !== 'forgotten' && (
          <button
            onClick={onOpenRescueModal}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 rounded-xl transition-all whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Rescue ({forgottenCount})</span>
          </button>
        )}

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-xs transition-all whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Quick Capture</span>
        </button>
      </div>
    </header>
  );
};
