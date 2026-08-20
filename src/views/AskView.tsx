import React, { useState, useEffect, useMemo } from 'react';
import {
  ProblemInput,
  Category,
  UrgencyLevel,
  SolutionAnalysis,
  Experience,
} from '../types';
import { analyzeProblem, fetchExperiences } from '../services/api';
import { CATEGORY_TAXONOMY, ALL_CATEGORIES, CategoryMetadata } from '../data/categoryTaxonomy';
import { Tooltip } from '../components/Tooltip';
import { AiWritingField } from '../components/AiWritingField';
import { AiWritingAssistantBanner } from '../components/AiWritingAssistantBanner';
import { ViewMode } from '../App';
import {
  Sparkles,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  Brain,
  AlertCircle,
  FileText,
  Lightbulb,
  Compass,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  BookOpen,
  ArrowUpRight,
  TrendingUp,
  Tag,
  Copy,
  Sliders,
  Check,
} from 'lucide-react';

interface AskViewProps {
  initialProblem?: string;
  initialCategory?: Category;
  onAnalysisComplete: (solution: SolutionAnalysis) => void;
  onNavigate?: (view: ViewMode) => void;
}

const SIMPLE_LOADING_STAGES = [
  'Checking your category and specific questions...',
  'Searching through real experiences in our community database...',
  'Looking at what worked and what failed for others...',
  'Finding the biggest lessons and common mistakes to avoid...',
  'Building a step-by-step action plan tailored for you...',
  'Almost ready! Finalizing your personalized recommendation...'
];

export const AskView: React.FC<AskViewProps> = ({
  initialProblem = '',
  initialCategory = 'Career',
  onAnalysisComplete,
  onNavigate,
}) => {
  // Form State
  const [problem, setProblem] = useState(initialProblem);
  const [context, setContext] = useState('');
  const [goal, setGoal] = useState('');
  const [alreadyTried, setAlreadyTried] = useState('');
  const [budget, setBudget] = useState('');
  const [timeConstraint, setTimeConstraint] = useState('');
  const [resources, setResources] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [category, setCategory] = useState<Category>(initialCategory);
  const [urgency, setUrgency] = useState<UrgencyLevel>('medium');

  // Dynamic Category Specific Detail Fields
  const [categoryDetails, setCategoryDetails] = useState<Record<string, string>>({});

  // UI View Mode (Form vs Category Experience Hub)
  const [activeTab, setActiveTab] = useState<'form' | 'experiences' | 'patterns'>('form');
  const [showCategoryIntelligence, setShowCategoryIntelligence] = useState(true);

  // Category experiences state
  const [categoryExperiences, setCategoryExperiences] = useState<Experience[]>([]);
  const [loadingCategoryExps, setLoadingCategoryExps] = useState(false);
  const [categoryStats, setCategoryStats] = useState<{ total: number; worked: number }>({
    total: 0,
    worked: 0,
  });

  // Submission State
  const [isLoading, setIsLoading] = useState(false);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Active Category Taxonomy Data
  const currentCategoryData: CategoryMetadata = useMemo(() => {
    return CATEGORY_TAXONOMY[category] || CATEGORY_TAXONOMY['Other'];
  }, [category]);

  // Load initial problem
  useEffect(() => {
    if (initialProblem && !problem) {
      setProblem(initialProblem);
    }
  }, [initialProblem]);

  // Fetch Category Experiences whenever Category changes
  useEffect(() => {
    let isMounted = true;
    const loadCategoryData = async () => {
      setLoadingCategoryExps(true);
      try {
        const res = await fetchExperiences({
          category: category,
          mode: 'all',
          sort: 'most_useful',
          limit: 10,
        });

        if (isMounted) {
          const exps = res.experiences || [];
          setCategoryExperiences(exps);
          const worked = exps.filter((e) => e.outcomeStatus === 'worked').length;
          setCategoryStats({
            total: exps.length,
            worked: worked,
          });
        }
      } catch (err) {
        console.warn('Failed to load category experiences:', err);
      } finally {
        if (isMounted) {
          setLoadingCategoryExps(false);
        }
      }
    };

    loadCategoryData();
    return () => {
      isMounted = false;
    };
  }, [category]);

  // Handle setting specific category details
  const handleCategoryDetailChange = (fieldId: string, value: string) => {
    setCategoryDetails((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  // Apply a category preset scenario
  const handleApplyPreset = (scenario: (typeof currentCategoryData.sampleScenarios)[0]) => {
    setProblem(scenario.data.problem);
    setContext(scenario.data.context);
    setGoal(scenario.data.goal);
    setAlreadyTried(scenario.data.alreadyTried || '');
    setBudget(scenario.data.constraints?.budget || '');
    setTimeConstraint(scenario.data.constraints?.time || '');
    setResources(scenario.data.constraints?.resources || '');
    setExperienceLevel(scenario.data.constraints?.experienceLevel || '');
    setCategory(scenario.data.category);
    setUrgency(scenario.data.urgency);
    setActiveTab('form');
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  // Use an existing category experience as a starting template
  const handleUseExperienceAsTemplate = (exp: Experience) => {
    setProblem(`I am facing a challenge like: "${exp.title}". Specifically, ${exp.situation}`);
    setContext(`Background: In my situation, key factors are...`);
    setGoal(`Achieve a good result like: "${exp.outcome}"`);
    setAlreadyTried(exp.actionsTaken.join(', '));
    setCategory(exp.category);
    setUrgency('medium');
    setActiveTab('form');
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  const handleResetForm = () => {
    setProblem('');
    setContext('');
    setGoal('');
    setAlreadyTried('');
    setBudget('');
    setTimeConstraint('');
    setResources('');
    setExperienceLevel('');
    setCategoryDetails({});
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem.trim()) {
      setError('Please tell us what problem or question you are facing.');
      setActiveTab('form');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentStageIdx(0);

    const stageInterval = setInterval(() => {
      setCurrentStageIdx((prev) => {
        if (prev < SIMPLE_LOADING_STAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 450);

    // Build enriched context with category specific details
    let fullContext = context.trim();
    const detailEntries = Object.entries(categoryDetails).filter(([_, val]) => typeof val === 'string' && val.trim().length > 0);
    if (detailEntries.length > 0) {
      const detailsList = detailEntries
        .map(([id, val]) => {
          const field = currentCategoryData.customFields.find((f) => f.id === id);
          return `${field ? field.label : id}: ${String(val).trim()}`;
        })
        .join('; ');
      fullContext = fullContext
        ? `${fullContext}\n\nKey ${currentCategoryData.shortLabel} Details: ${detailsList}`
        : `Key ${currentCategoryData.shortLabel} Details: ${detailsList}`;
    }

    const problemInput: ProblemInput = {
      problem: problem.trim(),
      context: fullContext,
      goal: goal.trim() || 'Find a tested, practical solution that works',
      alreadyTried: alreadyTried.trim(),
      constraints: {
        budget: budget.trim() || undefined,
        time: timeConstraint.trim() || undefined,
        resources: resources.trim() || undefined,
        experienceLevel: experienceLevel.trim() || undefined,
      },
      category,
      urgency,
      includeDemoData: true,
    };

    try {
      const solution = await analyzeProblem(problemInput);
      clearInterval(stageInterval);
      setTimeout(() => {
        setIsLoading(false);
        onAnalysisComplete(solution);
      }, 400);
    } catch (err: any) {
      clearInterval(stageInterval);
      setIsLoading(false);
      setError(err.message || 'We could not analyze your situation right now. Please try again.');
    }
  };

  const CategoryIcon = currentCategoryData.icon;

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-10 space-y-8 animate-fadeIn pb-16">
      {/* ========================================================
          HEADER & CATEGORY INTRODUCTION (In Simple English)
         ======================================================== */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800">
          <Brain className="w-3.5 h-3.5" />
          <span>REAL EXPERIENCES • PRACTICAL ANSWERS</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Ask Common Mind
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-3xl">
          Pick your category below. We will ask you simple questions and match your situation with tested solutions from people who faced the same challenge.
        </p>
      </div>

      {/* ========================================================
          1. CATEGORY PICKER (Plain & Clear)
         ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Step 1: Choose Your Category</span>
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Selected: <strong className="text-slate-900 dark:text-slate-200">{currentCategoryData.label}</strong>
          </span>
        </div>

        {/* Category Carousel / Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {ALL_CATEGORIES.map((catId) => {
            const meta = CATEGORY_TAXONOMY[catId];
            const Icon = meta.icon;
            const isSelected = category === catId;

            return (
              <button
                key={catId}
                type="button"
                id={`cat-select-${catId.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => {
                  setCategory(catId);
                }}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer group relative overflow-hidden ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-300 dark:ring-indigo-800'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/40 dark:hover:bg-slate-800/60 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : `${meta.badgeBg} ${meta.badgeText}`
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-xs leading-snug">
                    {meta.shortLabel}
                  </div>
                  <div
                    className={`text-[10px] truncate mt-0.5 ${
                      isSelected
                        ? 'text-indigo-100'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {meta.simpleTitle.split(',')[0]}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          2. ACTIVE CATEGORY GUIDE & LESSONS (Simple English)
         ======================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-all">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 via-indigo-50/30 to-purple-50/20 dark:from-slate-900 dark:via-indigo-950/20 dark:to-purple-950/20 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${currentCategoryData.badgeBg} ${currentCategoryData.badgeText} border ${currentCategoryData.borderClass}`}>
              <CategoryIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                  {currentCategoryData.simpleTitle}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300">
                  {categoryStats.total} Stories in Library
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {currentCategoryData.simpleDescription}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCategoryIntelligence(!showCategoryIntelligence)}
              className="text-xs text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <span>{showCategoryIntelligence ? 'Hide Tips & Lessons' : 'Show Tips & Lessons'}</span>
              {showCategoryIntelligence ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {showCategoryIntelligence && (
          <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 animate-fadeIn">
            {/* What Usually Works in this Category */}
            <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-300 text-xs">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>What Usually Works in {currentCategoryData.shortLabel}</span>
              </div>
              <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                {currentCategoryData.provenPatterns.map((pat, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{pat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Common Mistakes to Avoid */}
            <div className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-rose-900 dark:text-rose-300 text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Common Mistakes to Avoid in {currentCategoryData.shortLabel}</span>
              </div>
              <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                {currentCategoryData.commonPitfalls.map((pit, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold flex-shrink-0">•</span>
                    <span>{pit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* View Mode Sub-tabs (Form vs Matching Cases vs Example Presets) */}
        <div className="px-4 sm:px-5 py-2.5 bg-slate-50/80 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1">
            <button
              type="button"
              id="tab-mode-form"
              onClick={() => setActiveTab('form')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'form'
                  ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-2xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1. Fill in Your Details</span>
            </button>

            <button
              type="button"
              id="tab-mode-experiences"
              onClick={() => setActiveTab('experiences')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'experiences'
                  ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-2xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>2. Real Stories in this Category ({categoryExperiences.length})</span>
            </button>

            <button
              type="button"
              id="tab-mode-presets"
              onClick={() => setActiveTab('patterns')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'patterns'
                  ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-2xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>3. Ready-Made Example Scenarios ({currentCategoryData.sampleScenarios.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('experiences')}
                className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer"
              >
                <span>Browse All Categories</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          3. TAB CONTENT: MATCHING PEER CASES IN THIS CATEGORY
         ======================================================== */}
      {activeTab === 'experiences' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Real Experiences in {currentCategoryData.label}</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Click "Use as Template" to fill in your form automatically
            </span>
          </div>

          {loadingCategoryExps ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Loading {category} stories...</p>
            </div>
          ) : categoryExperiences.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <Compass className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No stories yet in {currentCategoryData.label}.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Be the first to describe your situation. Common Mind will use practical first-principles thinking to build your plan!
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Start Writing Your Question
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryExperiences.map((exp) => (
                <div
                  key={exp.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          exp.outcomeStatus === 'worked'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : exp.outcomeStatus === 'partially_worked'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                        }`}
                      >
                        {exp.outcomeStatus === 'worked'
                          ? 'Result: Worked'
                          : exp.outcomeStatus === 'partially_worked'
                          ? 'Result: Partially Worked'
                          : 'Result: Did Not Work'}
                      </span>
                      {exp.isDemo && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                          EXAMPLE STORY
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-snug">
                      {exp.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {exp.situation}
                    </p>

                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 text-[11px] text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800/60">
                      <strong className="text-indigo-700 dark:text-indigo-400 block mb-0.5">
                        Main Lesson:
                      </strong>
                      <span className="italic">"{exp.lesson}"</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Shared by {exp.authorName}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUseExperienceAsTemplate(exp)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Use as Template</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          4. TAB CONTENT: READY-MADE EXAMPLE SCENARIOS
         ======================================================== */}
      {activeTab === 'patterns' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Ready-Made Examples in {currentCategoryData.label}</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Pick one to fill the form in one click and edit it
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentCategoryData.sampleScenarios.map((sc, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                      Sample Scenario
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Urgency: {sc.data.urgency.toUpperCase()}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {sc.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {sc.summary}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 italic bg-slate-50 dark:bg-slate-950 p-2 rounded-lg">
                    "{sc.data.problem}"
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(sc)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 dark:bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors cursor-pointer"
                  >
                    <span>Load & Customize</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          5. MAIN INQUIRY FORM (Category-Tailored in Simple English)
         ======================================================== */}
      {activeTab === 'form' && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-7 animate-fadeIn"
        >
          {/* AI Assistant Banner */}
          <AiWritingAssistantBanner />

          {/* Category Tips Callout in Simple English */}
          <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-2.5 text-xs text-indigo-950 dark:text-indigo-200">
            <Lightbulb className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong>Quick Tips for {currentCategoryData.simpleTitle}:</strong>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                {currentCategoryData.questions.tailoredTips.map((tip, idx) => (
                  <span key={idx} className="flex items-center gap-1">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span>{tip}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 1. Problem (Category-Tailored Question in Simple English) */}
          <AiWritingField
            id="problem-textarea"
            fieldName="Problem Description"
            fieldCategoryContext={category}
            label={currentCategoryData.questions.problemLabel}
            labelExtra={
              <Tooltip content={currentCategoryData.questions.problemHelp} position="top">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
              </Tooltip>
            }
            required
            rows={3}
            value={problem}
            onChange={setProblem}
            placeholder={currentCategoryData.questions.problemPlaceholder}
          />

          {/* ========================================================
              CATEGORY-SPECIFIC DETAIL QUESTIONS (Dynamic per category)
             ======================================================== */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-950 dark:to-indigo-950/20 border border-indigo-100/80 dark:border-indigo-900/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center">
                  <Sliders className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                  {currentCategoryData.shortLabel} Details (Helps us find closer matches)
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                Click a quick suggestion or type your own
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentCategoryData.customFields.map((field) => {
                const currentVal = categoryDetails[field.id] || '';
                return (
                  <div key={field.id} className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      id={`custom-detail-${field.id}`}
                      value={currentVal}
                      onChange={(e) => handleCategoryDetailChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 outline-hidden transition-all"
                    />
                    {field.quickSuggestions && field.quickSuggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {field.quickSuggestions.map((sug, idx) => {
                          const isSelected = currentVal === sug;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleCategoryDetailChange(field.id, sug)}
                              className={`text-[10px] px-2 py-0.5 rounded-md border transition-all cursor-pointer flex items-center gap-1 ${
                                isSelected
                                  ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-300'
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5" />}
                              <span>{sug}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Context (Category-Tailored Question in Simple English) */}
          <AiWritingField
            id="context-textarea"
            fieldName="Background Details"
            fieldCategoryContext={category}
            label={currentCategoryData.questions.contextLabel}
            labelExtra={
              <Tooltip content={currentCategoryData.questions.contextHelp} position="top">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
              </Tooltip>
            }
            rows={2}
            value={context}
            onChange={setContext}
            placeholder={currentCategoryData.questions.contextPlaceholder}
          />

          {/* 3. Goal & What Tried (Category-Tailored in Simple English) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AiWritingField
              type="input"
              id="goal-input"
              fieldName="Target Outcome"
              fieldCategoryContext={category}
              label={currentCategoryData.questions.goalLabel}
              labelExtra={
                <Tooltip content={currentCategoryData.questions.goalHelp} position="top">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                </Tooltip>
              }
              value={goal}
              onChange={setGoal}
              placeholder={currentCategoryData.questions.goalPlaceholder}
            />

            <AiWritingField
              type="input"
              id="already-tried-input"
              fieldName="What Already Tried"
              fieldCategoryContext={category}
              label={currentCategoryData.questions.alreadyTriedLabel}
              labelExtra={
                <Tooltip content={currentCategoryData.questions.alreadyTriedHelp} position="top">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                </Tooltip>
              }
              value={alreadyTried}
              onChange={setAlreadyTried}
              placeholder={currentCategoryData.questions.alreadyTriedPlaceholder}
            />
          </div>

          {/* 4. Limits & Resources (Simple English) */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                5. Your Limits & Available Resources (Optional)
              </span>
              <Tooltip content="Tell us about your time and budget so we suggest realistic steps" position="top">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
              </Tooltip>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <AiWritingField
                type="input"
                id="constraint-time"
                fieldName="Available Time"
                fieldCategoryContext={category}
                label="Time Available"
                value={timeConstraint}
                onChange={setTimeConstraint}
                placeholder="e.g. 30 days, 2 hrs/day"
                inputClassName="text-xs p-2.5 rounded-lg"
              />

              <AiWritingField
                type="input"
                id="constraint-budget"
                fieldName="Budget Available"
                fieldCategoryContext={category}
                label="Budget Limit"
                value={budget}
                onChange={setBudget}
                placeholder="e.g. $0, Under $50"
                inputClassName="text-xs p-2.5 rounded-lg"
              />

              <AiWritingField
                type="input"
                id="constraint-experience"
                fieldName="Experience Level"
                fieldCategoryContext={category}
                label="Experience Level"
                value={experienceLevel}
                onChange={setExperienceLevel}
                placeholder="e.g. Beginner, 2 years"
                inputClassName="text-xs p-2.5 rounded-lg"
              />

              <AiWritingField
                type="input"
                id="constraint-resources"
                fieldName="Tools and Resources"
                fieldCategoryContext={category}
                label="Tools or Gear"
                value={resources}
                onChange={setResources}
                placeholder="e.g. Laptop, Books"
                inputClassName="text-xs p-2.5 rounded-lg"
              />
            </div>
          </div>

          {/* 5. Category & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Change Category
              </label>
              <select
                id="category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 outline-hidden cursor-pointer"
              >
                {ALL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  How Fast Do You Need Results?
                </label>
                <Tooltip content="Pick 'High' if you have a close deadline or need immediate relief" position="top">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                </Tooltip>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as UrgencyLevel[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    id={`urgency-${level}-btn`}
                    onClick={() => setUrgency(level)}
                    className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                      urgency === level
                        ? level === 'high'
                          ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-500 text-rose-800 dark:text-rose-300 ring-2 ring-rose-200 dark:ring-rose-900'
                          : level === 'medium'
                          ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-500 text-amber-800 dark:text-amber-300 ring-2 ring-amber-200 dark:ring-amber-900'
                          : 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-200 dark:ring-emerald-900'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {level === 'low' ? 'Low (No Rush)' : level === 'medium' ? 'Medium (Normal)' : 'High (Urgent)'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions & Submit Button */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetForm}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Everything</span>
            </button>

            <Tooltip content={`Match with real ${category} experiences and create your plan`} position="top">
              <button
                type="submit"
                id="analyze-situation-btn"
                disabled={isLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 shadow-md transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Get {currentCategoryData.shortLabel} Action Plan</span>
              </button>
            </Tooltip>
          </div>
        </form>
      )}

      {/* ========================================================
          6. SIMPLE ENGLISH LOADING OVERLAY
         ======================================================== */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 text-center">
            <div className="relative w-16 h-16 mx-auto">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-100 dark:border-indigo-950 border-t-indigo-600 dark:border-t-indigo-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-indigo-600 dark:text-indigo-400">
                {currentCategoryData.shortLabel.substring(0, 2).toUpperCase()}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                Analyzing Your {currentCategoryData.shortLabel} Question
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Looking for real-world stories and proven lessons that match your exact situation
              </p>
            </div>

            {/* Stage tracker */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-left space-y-2.5">
              {SIMPLE_LOADING_STAGES.map((stage, idx) => {
                const isDone = idx < currentStageIdx;
                const isCurrent = idx === currentStageIdx;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 text-xs transition-all ${
                      isCurrent
                        ? 'font-bold text-indigo-700 dark:text-indigo-400'
                        : isDone
                        ? 'text-emerald-700 dark:text-emerald-400 line-through opacity-70'
                        : 'text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    ) : isCurrent ? (
                      <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-ping flex-shrink-0" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 flex-shrink-0" />
                    )}
                    <span>{stage}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
