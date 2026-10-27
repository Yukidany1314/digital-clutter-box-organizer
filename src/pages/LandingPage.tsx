import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  BookOpen,
  CheckSquare,
  Bookmark,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingDown,
  Layers,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { enterDemoMode, isAuthenticated } = useAuth();

  const handleLaunchDemo = () => {
    enterDemoMode();
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Top Bar Contract (3 zones) */}
      <header className="h-16 px-6 lg:px-12 border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-xs">
            <Compass className="w-4 h-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900">
            ClutterBox
          </span>
        </div>

        {/* Zone 2: Clean single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <a href="#problem" className="hover:text-slate-900 transition-colors whitespace-nowrap">Problem</a>
          <a href="#smart-boxes" className="hover:text-slate-900 transition-colors whitespace-nowrap">Smart Boxes</a>
          <a href="#forgotten-treasure" className="hover:text-slate-900 transition-colors whitespace-nowrap">Forgotten Treasure</a>
          <a href="#clutter-score" className="hover:text-slate-900 transition-colors whitespace-nowrap">Clutter Score</a>
          <a href="#ai-assistant" className="hover:text-slate-900 transition-colors whitespace-nowrap">AI Assistant</a>
        </nav>

        {/* Zone 3: Primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/app')}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs"
            >
              Open Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={handleLaunchDemo}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl transition-all shadow-xs"
              >
                Launch Demo Mode
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 max-w-6xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-semibold text-indigo-700">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Save less mentally. Organize better. Rediscover what matters.</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.1] text-balance">
          The Digital Clutter Organizer with Automated Treasure Rescue
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Stop drowning in hundreds of open browser tabs, unread bookmarked articles, and forgotten notes. ClutterBox classifies your content into actionable Smart Boxes and rescues what truly matters.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
          <button
            onClick={handleLaunchDemo}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <span>Launch Live Demo (Instant Access)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-200 transition-colors"
          >
            Create Free Account
          </button>
        </div>

        {/* 5 Core Questions strip */}
        <div id="problem" className="pt-16 grid grid-cols-1 sm:grid-cols-5 gap-3 text-left">
          {[
            { q: 'What have I saved?', a: 'Consolidated repository across all links and ideas.' },
            { q: 'What to read or do?', a: 'Clean triage between READ articles and DO tasks.' },
            { q: 'What have I forgotten?', a: '14+ day neglect clock highlights sleeping gems.' },
            { q: 'What is still useful?', a: 'One-click transfer into durable REFERENCE storage.' },
            { q: 'How to reduce clutter?', a: 'Clutter Score progress ring and rescue randomizer.' },
          ].map((item, i) => (
            <div key={i} className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-mono font-bold text-indigo-600 block mb-1">
                0{i + 1}. Question
              </span>
              <h3 className="text-xs font-bold text-slate-900 mb-1">{item.q}</h3>
              <p className="text-[11px] text-slate-500 leading-normal">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Section: Smart Boxes */}
      <section id="smart-boxes" className="py-16 px-6 max-w-6xl mx-auto border-t border-slate-200/60">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Three Intentional Smart Boxes
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Never confuse passive reading with active work. Organize by intended outcome.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">READ Box</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Articles, blogs, tutorials, and video masterclasses saved for focused study sessions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">DO Box</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Actionable tasks, project ideas, portfolio milestones, and chores that require completion.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Bookmark className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">REFERENCE Box</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Documentation, syntax snippets, design references, and durable resources for fast retrieval.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Section: Forgotten Treasure & Clutter Score */}
      <section id="forgotten-treasure" className="py-16 px-6 max-w-6xl mx-auto border-t border-slate-200/60">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Signature Differentiator</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">
              Forgotten Treasure Engine & Rescue Randomizer
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Items sitting unreviewed for 14+ days automatically trigger Forgotten Treasure status. Rather than letting them drown in bookmark graveyards, ClutterBox calculates exact waiting times and provides a fun, 1-click rescue randomizer with 4 clear outcomes: Revisit, Complete, Reference, or Let Go.
            </p>
            <div className="pt-2">
              <button
                onClick={handleLaunchDemo}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Test Forgotten Treasure Live</span>
              </button>
            </div>
          </div>

          <div id="clutter-score" className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Transparent Clutter Score</h3>
              <span className="text-xs font-mono font-bold text-indigo-600">0–100 Scale</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Calculated using the deterministic formula:
              <br />
              <code className="font-mono text-indigo-600 font-bold">round(100 × attentionItems / activeItems)</code>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center text-xs">
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 font-semibold">
                0–24: Well Organized
              </div>
              <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100 text-blue-800 font-semibold">
                25–49: Light Clutter
              </div>
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100 text-amber-800 font-semibold">
                50–74: Needs Attention
              </div>
              <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100 text-rose-800 font-semibold">
                75–100: High Clutter
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-200 text-center text-xs text-slate-400">
        <p>© 2026 ClutterBox · Save less mentally. Organize better. Rediscover what matters.</p>
      </footer>
    </div>
  );
};
