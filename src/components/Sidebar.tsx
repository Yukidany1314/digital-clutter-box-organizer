import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  BookOpen,
  CheckSquare,
  Bookmark,
  Sparkles,
  CheckCircle2,
  Archive,
  Bot,
  Settings as SettingsIcon,
  X,
  Compass,
  LogOut,
  User,
  Shield,
} from 'lucide-react';
import { ClutterScoreData } from '../types';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  counts: {
    all: number;
    read: number;
    do: number;
    reference: number;
    forgotten: number;
    completed: number;
    archived: number;
  };
  clutterScore: ClutterScoreData;
  onOpenRescueModal: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  counts,
  clutterScore,
  onOpenRescueModal,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isDemoMode } = useAuth();

  const navItems = [
    {
      path: '/app',
      label: 'Dashboard',
      icon: LayoutDashboard,
      count: null,
    },
    {
      path: '/app/items',
      label: 'All Items',
      icon: Layers,
      count: counts.all,
    },
    {
      path: '/app/read',
      label: 'READ Box',
      icon: BookOpen,
      count: counts.read,
    },
    {
      path: '/app/do',
      label: 'DO Box',
      icon: CheckSquare,
      count: counts.do,
    },
    {
      path: '/app/reference',
      label: 'REFERENCE Box',
      icon: Bookmark,
      count: counts.reference,
    },
    {
      path: '/app/forgotten',
      label: 'Forgotten Treasure',
      icon: Sparkles,
      count: counts.forgotten,
      isSpecial: true,
    },
    {
      path: '/app/completed',
      label: 'Completed',
      icon: CheckCircle2,
      count: counts.completed,
    },
    {
      path: '/app/archived',
      label: 'Archived',
      icon: Archive,
      count: counts.archived,
    },
    {
      path: '/app/assistant',
      label: 'AI Assistant',
      icon: Bot,
      count: null,
      isAi: true,
    },
    {
      path: '/app/settings',
      label: 'Settings',
      icon: SettingsIcon,
      count: null,
    },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
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
        <div className="flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-xs">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold tracking-tight text-slate-900 block leading-tight">
                  ClutterBox
                </span>
                <span className="text-[10px] font-medium text-slate-400">
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

          {/* User profile / Demo mode banner */}
          <div className="px-4 pt-3 pb-2">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 font-bold text-xs">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 truncate text-[11px]">
                    {user?.displayName || 'User'}
                  </div>
                  {isDemoMode ? (
                    <span className="text-[10px] text-amber-700 font-semibold font-mono">
                      Demo Mode Active
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 truncate block">
                      {user?.email}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Action: Rescue Item button in sidebar */}
          <div className="px-4 py-2">
            <button
              onClick={onOpenRescueModal}
              disabled={counts.forgotten === 0}
              className={`w-full py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-between transition-all ${
                counts.forgotten > 0
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs hover:from-amber-600 hover:to-amber-700 active:scale-[0.99]'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Rescue an Item
              </span>
              <span className="text-[10px] font-mono tabular-nums opacity-90">
                {counts.forgotten} waiting
              </span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-0.5">
            <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Workspace Views
            </div>

            {navItems.map((item) => {
              const isActive =
                item.path === '/app'
                  ? location.pathname === '/app'
                  : location.pathname.startsWith(item.path);
              const Icon = item.icon;

              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? item.isSpecial
                        ? 'bg-amber-50 text-amber-900 font-semibold'
                        : item.isAi
                        ? 'bg-purple-50 text-purple-900 font-semibold'
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
                            : item.isAi
                            ? 'text-purple-600'
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

                  {item.isAi && !isActive && (
                    <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                      AI
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Clutter Score Mini-widget at bottom */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <div
            onClick={() => handleNavigate('/app')}
            className="cursor-pointer p-3 rounded-xl bg-white border border-slate-200/70 hover:border-indigo-200 transition-all shadow-xs"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                Clutter Score
              </span>
              <span className={`text-xs font-mono font-bold tabular-nums ${clutterScore.colorClass}`}>
                {clutterScore.score}/100
              </span>
            </div>

            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  clutterScore.score >= 75
                    ? 'bg-rose-500'
                    : clutterScore.score >= 50
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${clutterScore.score}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-500 mt-2 truncate">
              {clutterScore.label} · {clutterScore.attentionItems} need focus
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
