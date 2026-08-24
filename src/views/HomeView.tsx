import React, { useState } from 'react';
import { SAMPLE_PROBLEMS } from '../data/sampleProblems';
import { Experience, Category } from '../types';
import { ExperienceCard } from '../components/ExperienceCard';
import { Tooltip } from '../components/Tooltip';
import {
  Sparkles,
  ArrowRight,
  UserCheck,
  Brain,
  CheckCircle2,
  Layers,
  Search,
  Compass,
  Zap,
  TrendingUp,
  Shield,
  Clock,
  Briefcase,
  GraduationCap,
  Cpu,
  Target,
  DollarSign,
  HeartHandshake,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import { ViewMode } from '../App';

interface HomeViewProps {
  onNavigate: (view: ViewMode) => void;
  onSelectProblemPreset: (problemText: string, category?: Category) => void;
  featuredExperiences: Experience[];
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onSelectProblemPreset,
  featuredExperiences,
}) => {
  const [quickInput, setQuickInput] = useState('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickInput.trim()) {
      onSelectProblemPreset(quickInput.trim(), 'Other');
      onNavigate('ask');
    } else {
      onNavigate('ask');
    }
  };

  const categories: { name: Category; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
    { name: 'Career', icon: Briefcase, desc: 'Interview prep, job pivots, salary negotiation, workplace dynamics' },
    { name: 'Education', icon: GraduationCap, desc: 'Exam recovery, learning methods, college applications, thesis hurdles' },
    { name: 'Technology', icon: Cpu, desc: 'Architecture mistakes, tech stack transitions, tool adoption' },
    { name: 'Productivity', icon: Target, desc: 'Time management, ADHD workflows, deep work, anti-burnout' },
    { name: 'Personal Decisions', icon: UserCheck, desc: 'Relocation, habit changes, high-stakes trade-offs' },
    { name: 'Finance', icon: DollarSign, desc: 'Emergency budget recovery, debt repayment, fee negotiations' },
    { name: 'Relationships', icon: HeartHandshake, desc: 'Co-founder alignment, client boundaries, difficult conversations' },
    { name: 'Everyday Problems', icon: HelpCircle, desc: 'Freelance scope creep, home repair dilemmas, dispute resolutions' },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* ==========================================
          HERO SECTION
         ========================================== */}
      <section className="relative pt-8 sm:pt-14 pb-4 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Interactive Get Started Onboarding Entry Banner */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => onNavigate('onboarding')}
              id="hero-get-started-banner"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-2xs transition-all cursor-pointer group"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
              <span>New to Common Mind? Start 8-Step Guide</span>
              <ArrowRight className="w-3 h-3 text-indigo-500" />
            </button>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
            REAL EXPERIENCES.
            <br />
            <span className="bg-gradient-to-r from-indigo-700 via-slate-800 to-indigo-950 dark:from-indigo-300 dark:via-white dark:to-indigo-200 bg-clip-text text-transparent">
              REAL SOLUTIONS.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Learn from what others have experienced.
            <br className="hidden sm:inline" />
            Find practical, outcome-tested solutions for your exact situation.
          </p>

          {/* Central Large Input Bar */}
          <form
            onSubmit={handleQuickSubmit}
            className="max-w-2xl mx-auto mt-4 p-2 sm:p-2.5 rounded-2xl bg-white border-2 border-slate-300/80 shadow-md hover:border-indigo-500 focus-within:border-indigo-600 focus-within:ring-4 focus-within:ring-indigo-100 transition-all flex flex-col sm:flex-row gap-2"
          >
            <div className="flex-1 flex items-center px-3 gap-2">
              <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                id="hero-problem-input"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder="What's your situation? Describe a problem you're facing..."
                className="w-full text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent border-none outline-hidden"
              />
            </div>
            <Tooltip content="Submit your situation to generate AI guidance backed by human experience data" position="top">
              <button
                type="submit"
                id="hero-find-solution-btn"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-indigo-700 shadow-sm transition-all flex-shrink-0 cursor-pointer"
              >
                <span>Find a Solution</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Tooltip>
          </form>

          {/* Quick Problem Presets */}
          <div className="pt-2 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Or try a common situation:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
              {SAMPLE_PROBLEMS.map((preset, idx) => (
                <Tooltip key={idx} content={`Load template: ${preset.label}`} position="top">
                  <button
                    id={`preset-btn-${idx}`}
                    onClick={() => {
                      onSelectProblemPreset(preset.data.problem, preset.data.category);
                      onNavigate('ask');
                    }}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100/90 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-700 border border-slate-200 transition-all cursor-pointer"
                  >
                    {preset.label}
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          HOW COMMON MIND WORKS (4-STEP PIPELINE)
         ========================================== */}
      <section className="bg-slate-900 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-12 shadow-md">
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Engineered For Pragmatic Decision-Making
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            How Common Mind Works
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Common Mind is not a generic chatbot. It translates real human outcomes into actionable, step-by-step guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Step 1 */}
          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm border border-sky-500/30">
                01
              </div>
              <h3 className="font-bold text-base text-white">Share Your Situation</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Describe your exact goal, constraints, timeline, and what you’ve already tried.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-sky-400 flex items-center gap-1 pt-2 border-t border-slate-700/60">
              <span>Goal & Constraints</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-500/30">
                02
              </div>
              <h3 className="font-bold text-base text-white">Discover Experiences</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Retrieve structured peer experiences detailing actions taken and real-world outcomes.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-indigo-400 flex items-center gap-1 pt-2 border-t border-slate-700/60">
              <span>Verified Outcome Data</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm border border-purple-500/30">
                03
              </div>
              <h3 className="font-bold text-base text-white">AI Analyzes What Worked</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Algorithms isolate recurring success patterns and flag approaches that frequently failed.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-purple-400 flex items-center gap-1 pt-2 border-t border-slate-700/60">
              <span>Pattern Detection</span>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30">
                04
              </div>
              <h3 className="font-bold text-base text-white">Personalized Solution</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Receive a tailored step-by-step roadmap with transparent evidence citations and confidence metrics.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 pt-2 border-t border-slate-700/60">
              <span>Actionable Plan</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          WHY COMMON MIND? (TRADITIONAL VS COMMON MIND)
         ========================================== */}
      <section className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            A Fundamental Paradigm Shift
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Why Common Mind?
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Traditional AI synthesizes theoretical web text. Common Mind roots intelligence in reported human consequences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traditional AI Box */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="font-bold text-slate-700 text-sm">
                TRADITIONAL AI CHATBOT
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-600">
                Theoretical
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-600">
              Information ➔ LLM Token Prediction ➔ Generic Answer
            </div>

            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Generates broad advice without knowing if real people succeeded or failed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>No visibility into real-world constraints or error rates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Treats hypothetical ideas the same as verified outcomes</span>
              </li>
            </ul>
          </div>

          {/* Common Mind Box */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-emerald-50/40 border-2 border-indigo-500/40 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
              <div className="font-bold text-indigo-950 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                COMMON MIND
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-600 text-white">
                Experience-Driven
              </span>
            </div>

            <div className="p-3 bg-white/90 rounded-xl border border-indigo-200 text-xs font-mono font-semibold text-indigo-900">
              Experience ➔ Outcome ➔ Reasoning ➔ Solution
            </div>

            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Grounded in what people actually tried and what happened</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Identifies both winning patterns and documented failure traps</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Feedback loop: user trials continuously refine future intelligence</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ==========================================
          EXPLORE CATEGORIES
         ========================================== */}
      <section className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Browse Experience Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Explore real scenarios across key life and professional domains
            </p>
          </div>
          <button
            onClick={() => onNavigate('experiences')}
            className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.name}
                id={`cat-card-${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => {
                  onSelectProblemPreset('', cat.name);
                  onNavigate('experiences');
                }}
                className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-indigo-50 text-slate-700 group-hover:text-indigo-600 flex items-center justify-center transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
                <div className="pt-3 text-[11px] font-semibold text-indigo-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Explore Cases</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==========================================
          COMMUNITY EXPERIENCES CARDS / ZERO STATE
         ========================================== */}
      <section className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
              <Compass className="w-3.5 h-3.5 text-sky-600" />
              <span>COMMUNITY REPOSITORY</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {featuredExperiences.length > 0
                ? 'Recent Problem-Solving Experiences'
                : '0 Community Experiences'}
            </h2>
          </div>
          {featuredExperiences.length > 0 ? (
            <button
              onClick={() => onNavigate('experiences')}
              className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Explore All ({featuredExperiences.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => onNavigate('share-experience')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              <span>Be the first to share</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {featuredExperiences.length === 0 ? (
          <div className="p-8 sm:p-10 bg-white rounded-2xl border border-slate-200/90 text-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              No community experiences yet.
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Common Mind starts with zero pre-populated human experiences. Be one of the first people to share what you learned.
            </p>
            <div className="pt-2">
              <Tooltip content="Share what you tried, what happened, and what you learned to create the first entry" position="top">
                <button
                  id="home-first-share-btn"
                  onClick={() => onNavigate('share-experience')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs cursor-pointer transition-all"
                >
                  <span>Share What You Learned</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredExperiences.slice(0, 3).map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} showRelevance={false} />
            ))}
          </div>
        )}
      </section>

      {/* ==========================================
          CALL TO ACTION
         ========================================== */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 max-w-5xl mx-auto shadow-lg">
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Facing a High-Stakes Problem?
        </h2>
        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
          Don’t rely on trial and error alone. Discover what others did, what worked, and get an AI-reasoned plan tailored to your timeline and constraints.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Tooltip content="Analyze your situation against community trials" position="top">
            <button
              id="cta-ask-btn"
              onClick={() => onNavigate('ask')}
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-indigo-500 hover:bg-indigo-600 text-white shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>Ask Common Mind</span>
            </button>
          </Tooltip>
          <Tooltip content="Share what you tried and what happened to help future users" position="top">
            <button
              id="cta-share-btn"
              onClick={() => onNavigate('share-experience')}
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
            >
              <span>Share What You Learned</span>
            </button>
          </Tooltip>
        </div>
      </section>
    </div>
  );
};
