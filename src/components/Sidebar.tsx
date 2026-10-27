import React from 'react';
import {
  LayoutDashboard,
  Layers,
  BookOpen,
  CheckSquare,
  Bookmark,
  Sparkles,
  CheckCircle2,
  Settings as SettingsIcon,
  X,
  Compass,
} from 'lucide-react';
import { ViewTab } from '../types';
import { ClutterScoreData } from '../types';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  counts: {
    all: number;
    read: number;
    do: number;
    reference: number;
    forgotten: number;
    completed: number;
  };
  clutterScore: ClutterScoreData;
  onOpenRescueModal: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  counts,
  clutterScore,
  onOpenRescueModal,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'dashboard' as ViewTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      count: null,
    },
    {
      id: 'all' as ViewTab,
      label: 'All Items',
      icon: Layers,
      count: counts.all,
    },
    {
      id: 'read' as ViewTab,
      label: 'Read Box',
      icon: BookOpen,
      count: counts.read,
      hint: 'Articles, blogs & videos',
    },
    {
      id: 'do' as ViewTab,
      label: 'Do Box',
      icon: CheckSquare,
      count: counts.do,
      hint: 'Tasks & action items',
    },
    {
      id: 'reference' as ViewTab,
      label: 'Reference Box',
      icon: Bookmark,
      count: counts.reference,
      hint: 'Docs & useful tools',
    },
    {
      id: 'forgotten' as ViewTab,
      label: 'Forgotten Treasure',
      icon: Sparkles,
      count: counts.forgotten,
      isSpecial: true,
      hint: 'Items 14+ days unread',
    },
    {
      id: 'completed' as ViewTab,
      label: 'Completed',
      icon: CheckCircle2,
      count: counts.completed,
    },
    {
      id: 'settings' as ViewTab,
      label: 'Settings',
      icon: SettingsIcon,
      count: null,
    },
  ];

  const handleSelect = (tab: ViewTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-200 ease-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-slate-900">
                  ClutterBox
                </span>
                <span className="block text-[11px] font-medium text-slate-400">
                  Digital Space Organizer
                </span>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action: Rescue Item button in sidebar */}
          <div className="p-4 border-b border-slate-100">
            <button
              onClick={onOpenRescueModal}
              disabled={counts.forgotten === 0}
              className={`w-full py-2.5 px-3.5 rounded-xl font-medium text-xs flex items-center justify-between transition-all ${
                counts.forgotten > 0
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm hover:from-amber-600 hover:to-amber-700 active:scale-[0.99]'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Rescue an Item
              </span>
              <span className="text-[11px] font-mono tabular-nums opacity-90">
                {counts.forgotten} waiting
              </span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Workspaces
            </div>

            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? item.isSpecial
                        ? 'bg-amber-50 text-amber-900 font-semibold'
                        : 'bg-indigo-50 text-indigo-900 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive
                          ? item.isSpecial
                            ? 'text-amber-600'
                            : 'text-indigo-600'
                          : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.count !== null && (
                    <span
                      className={`text-[11px] font-mono tabular-nums px-2 py-0.5 rounded-md ${
                        isActive
                          ? item.isSpecial
                            ? 'bg-amber-200/60 text-amber-900 font-semibold'
                            : 'bg-indigo-200/60 text-indigo-900 font-semibold'
                          : item.isSpecial && item.count > 0
                          ? 'bg-amber-100 text-amber-800 font-medium'
                          : 'text-slate-400'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Clutter Score Mini-widget */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div
            onClick={() => handleSelect('dashboard')}
            className="cursor-pointer p-3 rounded-xl bg-white border border-slate-200/70 hover:border-indigo-200 transition-all shadow-xs"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Clutter Score
              </span>
              <span className={`text-xs font-mono font-bold tabular-nums ${clutterScore.colorClass}`}>
                {clutterScore.score}/100
              </span>
            </div>

            {/* Progress Track */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  clutterScore.score > 75
                    ? 'bg-rose-500'
                    : clutterScore.score > 45
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${clutterScore.score}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-500 mt-2 truncate">
              {clutterScore.label} · {clutterScore.activeItems} active
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
