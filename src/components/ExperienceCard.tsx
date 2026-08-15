import React, { useState } from 'react';
import { Experience } from '../types';
import { QualityBadge, OutcomeBadge, DemoTag } from './Badge';
import { Tooltip } from './Tooltip';
import { ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, User, Sparkles, AlertCircle } from 'lucide-react';
import { voteExperience } from '../services/api';

interface ExperienceCardProps {
  experience: Experience;
  onVote?: (id: string, vote: 'useful' | 'not_useful') => void;
  showRelevance?: boolean;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({
  experience,
  onVote,
  showRelevance = true,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [usefulCount, setUsefulCount] = useState(experience.usefulCount);
  const [notUsefulCount, setNotUsefulCount] = useState(experience.notUsefulCount);
  const [userVoted, setUserVoted] = useState<'useful' | 'not_useful' | null>(experience.userVoted || null);

  const handleVote = async (type: 'useful' | 'not_useful') => {
    if (userVoted === type) return;

    if (type === 'useful') {
      setUsefulCount((c) => c + 1);
      if (userVoted === 'not_useful') setNotUsefulCount((c) => Math.max(0, c - 1));
    } else {
      setNotUsefulCount((c) => c + 1);
      if (userVoted === 'useful') setUsefulCount((c) => Math.max(0, c - 1));
    }
    setUserVoted(type);

    await voteExperience(experience.id, type);
    if (onVote) onVote(experience.id, type);
  };

  return (
    <article
      id={`experience-card-${experience.id}`}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all duration-200 overflow-hidden flex flex-col justify-between"
    >
      {/* Header bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/40">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200/70 text-slate-800">
              {experience.category}
            </span>
            <QualityBadge label={experience.qualityLabel} />
            {experience.isDemo && (
              <Tooltip content="Created for testing and illustration. Demonstrates how real submissions look." position="top">
                <span><DemoTag /></span>
              </Tooltip>
            )}
          </div>

          {showRelevance && experience.relevanceScore !== undefined && (
            <Tooltip content="Calculated algorithmic match based on situation keywords, goals, and constraints" position="top">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/70 cursor-help">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span>{experience.relevanceScore}% Relevant</span>
              </div>
            </Tooltip>
          )}
        </div>

        <h3 className="text-base font-semibold text-slate-900 leading-snug">
          {experience.title}
        </h3>

        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>{experience.authorName}</span>
          <span>•</span>
          <span>{new Date(experience.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Structured Content (Situation -> Action -> Outcome -> Lesson) */}
      <div className="p-4 sm:p-5 space-y-3.5 text-sm flex-1">
        {/* Situation */}
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Situation
          </span>
          <p className="text-slate-700 leading-relaxed bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
            {experience.situation}
          </p>
        </div>

        {/* Actions Taken */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            What They Tried
          </span>
          <ul className="space-y-1 pl-1">
            {experience.actionsTaken.map((action, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                <span className="leading-snug">{action}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Outcome */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Outcome
            </span>
            <OutcomeBadge status={experience.outcomeStatus} />
          </div>
          <p className="text-slate-700 leading-relaxed">
            {experience.outcome}
          </p>
        </div>

        {/* Lesson Learned */}
        <div className="space-y-1 pt-1">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Core Lesson Learned
          </span>
          <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-100 text-indigo-950 font-medium text-xs sm:text-sm leading-relaxed">
            "{experience.lesson}"
          </div>
        </div>

        {/* Extended details on accordion */}
        {expanded && (
          <div className="space-y-3 pt-2 border-t border-slate-100 animate-fadeIn text-xs text-slate-600">
            {experience.whyChosen && (
              <div>
                <strong className="text-slate-700 block mb-0.5">Why they chose this approach:</strong>
                <p>{experience.whyChosen}</p>
              </div>
            )}
            {experience.whatWouldChange && (
              <div>
                <strong className="text-slate-700 block mb-0.5">What they would do differently:</strong>
                <p>{experience.whatWouldChange}</p>
              </div>
            )}
            {experience.tags && experience.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {experience.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px]">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer / Community Feedback bar */}
      <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
        <button
          id={`toggle-expand-${experience.id}`}
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
        >
          <span>{expanded ? 'Show Less' : 'Full Story'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 hidden sm:inline">Useful?</span>
          <Tooltip content="Mark this real experience as helpful for decision-making" position="top">
            <button
              id={`vote-useful-${experience.id}`}
              onClick={() => handleVote('useful')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                userVoted === 'useful'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <ThumbsUp className="w-3 h-3 text-emerald-600" />
              <span>{usefulCount}</span>
            </button>
          </Tooltip>

          <Tooltip content="Mark this experience as not applicable or unhelpful" position="top">
            <button
              id={`vote-not-useful-${experience.id}`}
              onClick={() => handleVote('not_useful')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                userVoted === 'not_useful'
                  ? 'bg-rose-100 text-rose-800 border border-rose-300 font-semibold'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <ThumbsDown className="w-3 h-3 text-rose-500" />
              <span>{notUsefulCount}</span>
            </button>
          </Tooltip>
        </div>
      </div>
    </article>
  );
};
