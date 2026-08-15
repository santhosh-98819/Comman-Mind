import React from 'react';
import { QualityLabel, OutcomeStatus } from '../types';
import { Sparkles, User, Brain, AlertTriangle, ShieldCheck, CheckCircle2, XCircle, Clock } from 'lucide-react';

export interface BadgeProps {
  type?: 'experience' | 'analysis' | 'recommendation' | 'uncertainty' | 'demo';
  className?: string;
  children?: React.ReactNode;
}

export const SectionTag: React.FC<{
  type: 'human' | 'analysis' | 'recommendation' | 'uncertainty';
  label?: string;
}> = ({ type, label }) => {
  if (type === 'human') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
        <User className="w-3.5 h-3.5 text-sky-600" />
        <span>{label || 'REAL HUMAN EXPERIENCE'}</span>
      </div>
    );
  }
  if (type === 'analysis') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
        <Brain className="w-3.5 h-3.5 text-indigo-600" />
        <span>{label || 'AI PATTERN ANALYSIS'}</span>
      </div>
    );
  }
  if (type === 'recommendation') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
        <span>{label || 'COMMON MIND RECOMMENDATION'}</span>
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
      <span>{label || 'UNCERTAINTIES & LIMITS'}</span>
    </div>
  );
};

export const QualityBadge: React.FC<{ label?: QualityLabel }> = ({ label }) => {
  switch (label) {
    case 'Highly Relevant':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ShieldCheck className="w-3 h-3" />
          Highly Relevant
        </span>
      );
    case 'Useful Experience':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <CheckCircle2 className="w-3 h-3" />
          Useful Experience
        </span>
      );
    case 'Limited Evidence':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3 h-3" />
          Limited Evidence
        </span>
      );
    case 'Conflicting Experiences':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
          <AlertTriangle className="w-3 h-3" />
          Conflicting Experiences
        </span>
      );
    default:
      return null;
  }
};

export const OutcomeBadge: React.FC<{ status: OutcomeStatus }> = ({ status }) => {
  switch (status) {
    case 'worked':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          WORKED
        </span>
      );
    case 'partially_worked':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          PARTIALLY WORKED
        </span>
      );
    case 'did_not_work':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          DIDN'T WORK
        </span>
      );
  }
};

export const DemoTag: React.FC = () => {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
      DEMO EXPERIENCE
    </span>
  );
};
