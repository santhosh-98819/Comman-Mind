import React, { useState, useEffect } from 'react';
import { ProblemInput, Category, UrgencyLevel, SolutionAnalysis } from '../types';
import { analyzeProblem } from '../services/api';
import { SAMPLE_PROBLEMS } from '../data/sampleProblems';
import { Tooltip } from '../components/Tooltip';
import { AiWritingField } from '../components/AiWritingField';
import { AiWritingAssistantBanner } from '../components/AiWritingAssistantBanner';
import {
  Sparkles,
  ArrowRight,
  Clock,
  DollarSign,
  Briefcase,
  HelpCircle,
  CheckCircle2,
  Brain,
  Layers,
  AlertCircle,
  FileText,
  Search,
} from 'lucide-react';

interface AskViewProps {
  initialProblem?: string;
  initialCategory?: Category;
  onAnalysisComplete: (solution: SolutionAnalysis) => void;
}

const LOADING_STAGES = [
  'Understanding your situation...',
  'Finding relevant peer experiences in database...',
  'Comparing reported actions and outcomes...',
  'Identifying success patterns and failure modes...',
  'Evaluating approaches against your constraints...',
  'Building your personalized recommendation...'
];

export const AskView: React.FC<AskViewProps> = ({
  initialProblem = '',
  initialCategory = 'Career',
  onAnalysisComplete,
}) => {
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

  const [isLoading, setIsLoading] = useState(false);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialProblem && !problem) {
      setProblem(initialProblem);
    }
  }, [initialProblem]);

  const handleApplyPreset = (preset: (typeof SAMPLE_PROBLEMS)[0]) => {
    setProblem(preset.data.problem);
    setContext(preset.data.context);
    setGoal(preset.data.goal);
    setAlreadyTried(preset.data.alreadyTried || '');
    setBudget(preset.data.constraints?.budget || '');
    setTimeConstraint(preset.data.constraints?.time || '');
    setResources(preset.data.constraints?.resources || '');
    setExperienceLevel(preset.data.constraints?.experienceLevel || '');
    setCategory(preset.data.category);
    setUrgency(preset.data.urgency);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem.trim()) {
      setError('Please provide a description of the problem or situation you are facing.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentStageIdx(0);

    const stageInterval = setInterval(() => {
      setCurrentStageIdx((prev) => {
        if (prev < LOADING_STAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 450);

    const problemInput: ProblemInput = {
      problem: problem.trim(),
      context: context.trim(),
      goal: goal.trim() || 'Find an effective, outcome-tested solution',
      alreadyTried: alreadyTried.trim(),
      constraints: {
        budget: budget.trim() || undefined,
        time: timeConstraint.trim() || undefined,
        resources: resources.trim() || undefined,
        experienceLevel: experienceLevel.trim() || undefined,
      },
      category,
      urgency,
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

  const categories: Category[] = [
    'Career',
    'Education',
    'Technology',
    'Productivity',
    'Personal Decisions',
    'Finance',
    'Relationships',
    'Everyday Problems',
    'Other',
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
          <Brain className="w-3.5 h-3.5" />
          <span>EXPERIENCE-BASED PROBLEM SOLVING</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          What are you dealing with?
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Provide as much context as you’d like. Common Mind will search matching peer outcomes and synthesize a tailored strategy.
        </p>
      </div>

      {/* Quick Preset Selector */}
      <div className="p-4 bg-slate-100/80 rounded-2xl border border-slate-200/80 space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
          Quick-load a sample scenario:
        </span>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PROBLEMS.map((preset, idx) => (
            <Tooltip key={idx} content={`Load sample: ${preset.label}`} position="top">
              <button
                type="button"
                id={`ask-preset-${idx}`}
                onClick={() => handleApplyPreset(preset)}
                className="px-3 py-1.5 bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-all text-left cursor-pointer"
              >
                {preset.label}
              </button>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Main Submission Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Optional AI Assistant Status Banner */}
        <AiWritingAssistantBanner />

        {/* 1. Problem */}
        <AiWritingField
          id="problem-textarea"
          fieldName="Problem Description"
          fieldCategoryContext={category}
          label="1. Problem / Situation"
          labelExtra={
            <Tooltip content="Describe what you are trying to solve or decide" position="top">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
            </Tooltip>
          }
          required
          rows={3}
          value={problem}
          onChange={setProblem}
          placeholder="Describe the specific challenge you are facing..."
        />

        {/* 2. Context */}
        <AiWritingField
          id="context-textarea"
          fieldName="Background Context"
          fieldCategoryContext={category}
          label="2. Background Context"
          labelExtra={
            <Tooltip content="Key variables, timeline, or environmental factors that influence the decision" position="top">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
            </Tooltip>
          }
          rows={2}
          value={context}
          onChange={setContext}
          placeholder="What details explain how you got here? What are the key stakes or environment?"
        />

        {/* 3. Goal & What Tried */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AiWritingField
            type="input"
            id="goal-input"
            fieldName="Desired Goal"
            fieldCategoryContext={category}
            label="3. Desired Goal"
            labelExtra={
              <Tooltip content="What does a successful outcome look like for you?" position="top">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
              </Tooltip>
            }
            value={goal}
            onChange={setGoal}
            placeholder="What specific outcome do you want to achieve?"
          />

          <AiWritingField
            type="input"
            id="already-tried-input"
            fieldName="What Already Tried"
            fieldCategoryContext={category}
            label="4. What have you already tried?"
            labelExtra={
              <Tooltip content="Prevent the AI from recommending approaches you already ruled out" position="top">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
              </Tooltip>
            }
            value={alreadyTried}
            onChange={setAlreadyTried}
            placeholder="Any past attempts, and why they didn't work..."
          />
        </div>

        {/* 4. Constraints */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-800">
              5. Constraints & Resources
            </span>
            <Tooltip content="Personal boundaries help tailor plans so they are realistic for you" position="top">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
            </Tooltip>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <AiWritingField
              type="input"
              id="constraint-time"
              fieldName="Time Constraint"
              label="Time Available"
              value={timeConstraint}
              onChange={setTimeConstraint}
              placeholder="e.g. 30 days, 2 hrs/day"
              inputClassName="text-xs p-2.5 rounded-lg"
            />

            <AiWritingField
              type="input"
              id="constraint-budget"
              fieldName="Budget Constraint"
              label="Budget"
              value={budget}
              onChange={setBudget}
              placeholder="e.g. $0, Under $100"
              inputClassName="text-xs p-2.5 rounded-lg"
            />

            <AiWritingField
              type="input"
              id="constraint-experience"
              fieldName="Experience Level"
              label="Experience Level"
              value={experienceLevel}
              onChange={setExperienceLevel}
              placeholder="e.g. Beginner, 2 yrs"
              inputClassName="text-xs p-2.5 rounded-lg"
            />

            <AiWritingField
              type="input"
              id="constraint-resources"
              fieldName="Tools and Resources"
              label="Tools / Resources"
              value={resources}
              onChange={setResources}
              placeholder="e.g. Laptop, Books"
              inputClassName="text-xs p-2.5 rounded-lg"
            />
          </div>
        </div>

        {/* 5. Category & Urgency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
              Category
            </label>
            <select
              id="category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full text-sm p-3 rounded-xl border border-slate-300 bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-hidden cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                Urgency Level
              </label>
              <Tooltip content="High urgency prioritizes faster-acting initial steps" position="top">
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
                        ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-200'
                        : level === 'medium'
                        ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-200'
                        : 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-200'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <Tooltip content="Query the community library and synthesize an action plan" position="top">
            <button
              type="submit"
              id="analyze-situation-btn"
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-indigo-700 shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Analyze My Situation</span>
            </button>
          </Tooltip>
        </div>
      </form>

      {/* ==========================================
          INTELLIGENT LOADING EXPERIENCE OVERLAY
         ========================================== */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 text-center">
            <div className="relative w-16 h-16 mx-auto">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-indigo-600">
                CM
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-lg text-slate-900">
                Synthesizing Collective Intelligence
              </h3>
              <p className="text-xs text-slate-500">
                Connecting human outcomes with AI reasoning
              </p>
            </div>

            {/* Stage tracker */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-left space-y-2.5">
              {LOADING_STAGES.map((stage, idx) => {
                const isDone = idx < currentStageIdx;
                const isCurrent = idx === currentStageIdx;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 text-xs transition-all ${
                      isCurrent
                        ? 'font-bold text-indigo-700'
                        : isDone
                        ? 'text-emerald-700 line-through opacity-70'
                        : 'text-slate-400'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    ) : isCurrent ? (
                      <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping flex-shrink-0" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-slate-300 flex-shrink-0" />
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
