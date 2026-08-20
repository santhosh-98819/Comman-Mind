import React, { useState, useEffect } from 'react';
import { UserProfile, PlatformStats, SolutionAnalysis } from '../types';
import { fetchPlatformStats, getLocalSavedSolutions, getLocalActiveSolutions, getLocalUser } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Tooltip } from '../components/Tooltip';
import {
  LayoutDashboard,
  Sparkles,
  User,
  Heart,
  CheckCircle2,
  Bookmark,
  Share2,
  ArrowRight,
  TrendingUp,
  Brain,
  Compass,
  CheckSquare,
  HelpCircle,
} from 'lucide-react';
import { ViewMode } from '../App';

interface DashboardViewProps {
  user?: UserProfile;
  onNavigate: (view: ViewMode) => void;
  onSelectSolution: (solution: SolutionAnalysis) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user: propUser,
  onNavigate,
  onSelectSolution,
}) => {
  const { userProfile, currentUser } = useAuth();
  const activeUser = userProfile || propUser || getLocalUser();
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [activeSolutions, setActiveSolutions] = useState<SolutionAnalysis[]>([]);
  const [savedSolutions, setSavedSolutions] = useState<SolutionAnalysis[]>([]);

  useEffect(() => {
    fetchPlatformStats().then(setPlatformStats);
    setActiveSolutions(getLocalActiveSolutions());
    setSavedSolutions(getLocalSavedSolutions());
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const allSolutionsMap = new Map<string, SolutionAnalysis>();
  savedSolutions.forEach((s) => allSolutionsMap.set(s.id, s));
  activeSolutions.forEach((s) => {
    const existing = allSolutionsMap.get(s.id);
    if (existing) {
      allSolutionsMap.set(s.id, {
        ...existing,
        ...s,
        status: s.status || existing.status,
        outcomeReport: s.outcomeReport || existing.outcomeReport,
      });
    } else {
      allSolutionsMap.set(s.id, s);
    }
  });
  const allSolutions = Array.from(allSolutionsMap.values());
  const completedSolutions = allSolutions.filter((s) => s.status === 'completed' || !!s.outcomeReport);

  return (
    <div className="max-w-6xl mx-auto py-6 sm:py-10 space-y-8 animate-fadeIn pb-16">
      {/* Greeting Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>PERSONAL DECISION DASHBOARD</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {getGreeting()}, {activeUser.name}
          </h1>
          <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
            What's on your mind today? Check your active problem test loops or explore new peer cases.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Tooltip content="Diagnose a new situation with human cases + AI synthesis" position="bottom">
            <button
              id="dash-ask-btn"
              onClick={() => onNavigate('ask')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Ask Common Mind</span>
            </button>
          </Tooltip>

          <Tooltip content="Contribute a solution trial or life lesson to the repository" position="bottom">
            <button
              id="dash-share-exp-btn"
              onClick={() => onNavigate('share-experience')}
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer"
            >
              <span>Share Learning</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* User Impact & Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Problems */}
        <Tooltip content="View all decisions currently being tested or tracked" position="top">
          <div
            onClick={() => onNavigate('solutions')}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 hover:shadow-2xs transition-all cursor-pointer space-y-2 h-full"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Active Problems</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Brain className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {activeSolutions.length}
            </div>
            <p className="text-[11px] text-slate-500">
              {activeSolutions.filter((s) => s.status === 'testing').length} in active testing
            </p>
          </div>
        </Tooltip>

        {/* Card 2: Solutions Tested & Completed */}
        <Tooltip content="Plans where you have tested and reported outcomes" position="top">
          <div
            onClick={() => onNavigate('solutions')}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-300 hover:shadow-2xs transition-all cursor-pointer space-y-2 h-full"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Completed Solutions</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-900">
              {completedSolutions.length}
            </div>
            <p className="text-[11px] text-emerald-700">
              Outcomes recorded in repository
            </p>
          </div>
        </Tooltip>

        {/* Card 3: Experiences Shared */}
        <Tooltip content="Number of real-world experiences contributed to the community" position="top">
          <div
            onClick={() => onNavigate('experiences')}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-sky-300 hover:shadow-2xs transition-all cursor-pointer space-y-2 h-full"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Experiences Shared</span>
              <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {activeUser.experiencesShared}
            </div>
            <p className="text-[11px] text-slate-500">
              Contributing to collective intelligence
            </p>
          </div>
        </Tooltip>

        {/* Card 4: People Helped */}
        <Tooltip content="Estimated users who have referenced your submitted experiences" position="top">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-emerald-50/30 border border-indigo-200/70 space-y-2 h-full">
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-900">
              <span>Community Impact</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {activeUser.peopleHelped > 0 ? activeUser.peopleHelped : 0}
            </div>
            <p className="text-[11px] text-slate-600 font-medium">
              {activeUser.peopleHelped > 0
                ? `Your experiences have helped ${activeUser.peopleHelped} people.`
                : 'Share an experience to help community peers.'}
            </p>
          </div>
        </Tooltip>
      </div>

      {/* Main Grid: Active Solutions & Platform Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Active Solutions & Recent Tracks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Active Strategy Plans
            </h2>
            <button
              onClick={() => onNavigate('solutions')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeSolutions.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-3 shadow-2xs">
              <p className="text-xs font-semibold text-slate-600">
                You haven't submitted any problems yet.
              </p>
              <button
                onClick={() => onNavigate('ask')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-indigo-700 cursor-pointer"
              >
                Ask Common Mind
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeSolutions.slice(0, 3).map((sol) => (
                <div
                  key={sol.id}
                  onClick={() => onSelectSolution(sol)}
                  className="p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {sol.originalProblem.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(sol.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 line-clamp-1">
                      {sol.originalProblem.problem}
                    </h3>
                    <p className="text-xs text-indigo-600 font-medium">
                      {sol.recommendationSteps.length} Steps • {sol.evidence.confidencePercentage}% Evidence Confidence
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Platform Health & Collective Insights */}
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Collective Knowledge Pool
          </h2>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Real Community Cases:</span>
                <span className="font-bold text-slate-900">
                  {platformStats ? platformStats.totalRealExperiences : 0} verified
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Reported Outcomes:</span>
                <span className="font-bold text-slate-900">
                  {platformStats ? platformStats.totalOutcomesReported : 0} trials
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Community Contributors:</span>
                <span className="font-bold text-slate-900">
                  {platformStats ? platformStats.communityContributors : 0} people
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Demo Reference Records:</span>
                <span className="font-bold text-amber-800">
                  {platformStats ? platformStats.totalDemoExperiences : 0} demo cases
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Outcome Success Rate:</span>
                <span className="font-bold text-emerald-600">
                  {platformStats && platformStats.totalOutcomesReported > 0
                    ? `${platformStats.successfulSolutionsRatio}% positive`
                    : 'Awaiting 1st trial'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-3">
              {(!platformStats || platformStats.totalRealExperiences === 0) ? (
                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
                  <span className="font-bold block">No community experiences yet</span>
                  <p className="leading-relaxed">
                    You're among the first people building the Common Mind experience knowledge base. Share a real outcome to create the first entry.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <span className="font-bold text-slate-800 block">The Common Mind Principle:</span>
                  <p>
                    Every trial you log as an outcome directly refines future reasoning, making solutions smarter for the next person facing your challenge.
                  </p>
                </div>
              )}

              <button
                onClick={() => onNavigate('profile')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-indigo-50/70 hover:bg-indigo-100/80 border border-indigo-100 text-indigo-900 text-xs font-bold transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600" />
                  <span>Manage Profile & Privacy</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
