import React, { useState } from 'react';
import { Category, OutcomeStatus, Experience } from '../types';
import { submitExperience } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Tooltip } from '../components/Tooltip';
import { AiWritingField } from '../components/AiWritingField';
import { AiWritingAssistantBanner } from '../components/AiWritingAssistantBanner';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  PlusCircle,
  Shield,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  Info,
  Send,
  User,
  HelpCircle,
} from 'lucide-react';
import { ViewMode } from '../App';

interface ShareExperienceViewProps {
  onNavigate: (view: ViewMode) => void;
  onExperienceAdded?: (exp: Experience) => void;
}

export const ShareExperienceView: React.FC<ShareExperienceViewProps> = ({
  onNavigate,
  onExperienceAdded,
}) => {
  const { currentUser, userProfile, isGuest } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Career');
  const [situation, setSituation] = useState('');
  const [actionsInput, setActionsInput] = useState('');
  const [whyChosen, setWhyChosen] = useState('');
  const [outcome, setOutcome] = useState('');
  const [outcomeStatus, setOutcomeStatus] = useState<OutcomeStatus>('worked');
  const [whatWouldChange, setWhatWouldChange] = useState('');
  const [lesson, setLesson] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [authorName, setAuthorName] = useState(userProfile?.name || (currentUser?.displayName ?? ''));
  const [tagsInput, setTagsInput] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!situation.trim() || !actionsInput.trim() || !outcome.trim() || !lesson.trim()) {
      setError('Please fill in all core fields (Situation, Actions Tried, Outcome, and Lesson Learned).');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const actionsArray = actionsInput
      .split('\n')
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      const newExp = await submitExperience({
        title: title.trim() || `${category} Experience: ${situation.slice(0, 45)}...`,
        category,
        situation: situation.trim(),
        actionsTaken: actionsArray.length > 0 ? actionsArray : [actionsInput.trim()],
        whyChosen: whyChosen.trim(),
        outcome: outcome.trim(),
        outcomeStatus,
        lesson: lesson.trim(),
        whatWouldChange: whatWouldChange.trim(),
        isAnonymous,
        authorName: isAnonymous ? 'Anonymous Contributor' : authorName.trim() || userProfile?.name || 'Community Contributor',
        tags: tagsArray.length > 0 ? tagsArray : [category, 'Community'],
      });

      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {}

      if (onExperienceAdded) onExperienceAdded(newExp);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit experience.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
          <PlusCircle className="w-3.5 h-3.5" />
          <span>COMMUNITY KNOWLEDGE FLYWHEEL</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Share What You Learned
        </h1>
        <p className="text-sm text-slate-600">
          Your real experiences help others avoid costly mistakes and choose proven paths.
        </p>
      </div>

      {submitted ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-12 text-center space-y-5 shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Thank You for Contributing!
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Your experience is now structured in the Common Mind repository. The AI reasoning engine will draw on your outcome when users face similar dilemmas.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('experiences')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 cursor-pointer"
            >
              Browse Experience Database
            </button>
            <button
              onClick={() => {
                setSubmitted(false);
                setSituation('');
                setActionsInput('');
                setOutcome('');
                setLesson('');
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
            >
              Submit Another
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          {/* AI Assistant Banner */}
          <AiWritingAssistantBanner />

          {/* Privacy Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Privacy Reminder</span>
            </div>
            <p>
              Please avoid including identifying details (company names, personal names, phone numbers). You can submit anonymously or under your display name.
            </p>
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <AiWritingField
                type="input"
                id="experience-title"
                fieldName="Experience Title"
                fieldCategoryContext={category}
                label="Experience Title"
                value={title}
                onChange={setTitle}
                placeholder="e.g. How I negotiated freelance scope creep without losing the client"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full text-sm p-3 rounded-xl border border-slate-300 bg-white focus:border-indigo-600 outline-hidden cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 1. What was your situation? */}
          <AiWritingField
            id="situation-textarea"
            fieldName="Situation"
            fieldCategoryContext={category}
            label="1. What was your situation?"
            labelExtra={
              <Tooltip content="Describe the dilemma, challenge, or choice you faced" position="top">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
              </Tooltip>
            }
            required
            rows={3}
            value={situation}
            onChange={setSituation}
            placeholder="What initial state, obstacle, or timeline were you confronting?"
          />

          {/* 2. What did you try? */}
          <AiWritingField
            id="actions-textarea"
            fieldName="Actions Taken"
            fieldCategoryContext={category}
            label="2. What did you try? (Actions Taken)"
            labelExtra={
              <Tooltip content="Specific steps or decisions you implemented (one per line)" position="top">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
              </Tooltip>
            }
            required
            rows={3}
            value={actionsInput}
            onChange={setActionsInput}
            placeholder="Enter specific actions taken (one per line)..."
            helperText="Tip: Put each distinct action on its own line for structured rendering."
          />

          {/* 3. Why did you choose that approach? */}
          <AiWritingField
            type="input"
            id="why-chosen-input"
            fieldName="Why Chosen"
            fieldCategoryContext={category}
            label="3. Why did you choose that approach?"
            value={whyChosen}
            onChange={setWhyChosen}
            placeholder="What was your initial hypothesis or reasoning?"
          />

          {/* 4. Did it work? */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
              4. Did it work? (Outcome Status) <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <Tooltip content="The strategy succeeded and achieved the desired outcome" position="top">
                <button
                  type="button"
                  onClick={() => setOutcomeStatus('worked')}
                  className={`w-full p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    outcomeStatus === 'worked'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-200'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>WORKED</span>
                </button>
              </Tooltip>

              <Tooltip content="Mixed results: some parts succeeded, others required revision" position="top">
                <button
                  type="button"
                  onClick={() => setOutcomeStatus('partially_worked')}
                  className={`w-full p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    outcomeStatus === 'partially_worked'
                      ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-200'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>PARTIALLY</span>
                </button>
              </Tooltip>

              <Tooltip content="Failed or hit dead-ends (crucial data for warning others)" position="top">
                <button
                  type="button"
                  onClick={() => setOutcomeStatus('did_not_work')}
                  className={`w-full p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    outcomeStatus === 'did_not_work'
                      ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-200'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>DIDN'T WORK</span>
                </button>
              </Tooltip>
            </div>
          </div>

          {/* 5. What happened? */}
          <AiWritingField
            id="outcome-textarea"
            fieldName="Outcome / Result"
            fieldCategoryContext={category}
            label="5. What happened? (Real-World Outcome)"
            labelExtra={
              <Tooltip content="Concrete consequences and measurements" position="top">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
              </Tooltip>
            }
            required
            rows={3}
            value={outcome}
            onChange={setOutcome}
            placeholder="Describe the tangible result or outcome..."
          />

          {/* 6. What did you learn? */}
          <AiWritingField
            type="input"
            id="lesson-input"
            fieldName="Lesson Learned"
            fieldCategoryContext={category}
            label="6. What did you learn? (Core Takeaway)"
            labelExtra={
              <Tooltip content="The #1 insight future users should remember" position="top">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
              </Tooltip>
            }
            required
            value={lesson}
            onChange={setLesson}
            placeholder="e.g. Mock testing with peers revealed flaws that solo studying hid completely."
          />

          {/* 7. What would you do differently? */}
          <AiWritingField
            type="input"
            id="what-would-change-input"
            fieldName="What Would Change"
            fieldCategoryContext={category}
            label="7. What would you do differently?"
            value={whatWouldChange}
            onChange={setWhatWouldChange}
            placeholder="e.g. Set up change order clauses in the initial contract rather than later."
          />

          {/* Anonymous toggle & author */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Post Anonymously</span>
            </label>

            {!isAnonymous && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Your Name & Title (e.g. Maya, PM)"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="text-xs p-2 rounded-lg border border-slate-300 w-60 outline-hidden"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
              {error}
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Tooltip content="Publish this experience to the community knowledge base" position="top">
              <button
                type="submit"
                disabled={isSubmitting}
                id="share-experience-submit-btn"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-indigo-700 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Publishing...' : 'Share Experience'}</span>
              </button>
            </Tooltip>
          </div>
        </form>
      )}
    </div>
  );
};
