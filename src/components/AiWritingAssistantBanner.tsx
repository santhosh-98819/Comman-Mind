import React, { useState } from 'react';
import { Sparkles, Shield, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { useWritingAssist } from '../contexts/WritingAssistContext';

interface AiWritingAssistantBannerProps {
  compact?: boolean;
}

export const AiWritingAssistantBanner: React.FC<AiWritingAssistantBannerProps> = ({
  compact = false,
}) => {
  const { isEnabled, toggleEnabled } = useWritingAssist();
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-slate-50 to-purple-50/70 dark:from-indigo-950/40 dark:via-slate-900/60 dark:to-purple-950/40 border border-indigo-100/90 dark:border-indigo-900/50 text-xs shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-slate-100">AI Writing Assistant</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isEnabled
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {isEnabled ? 'Active & Ready' : 'Turned Off'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Assists with real-time spelling, grammar, clarity, and constructive tone without altering your original meaning.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDetailsOpen(!detailsOpen)}
            className="text-[11px] text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 flex items-center gap-1 font-medium cursor-pointer"
          >
            <span>How it works</span>
            {detailsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            type="button"
            onClick={toggleEnabled}
            id="global-ai-assist-toggle"
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              isEnabled
                ? 'bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-700 dark:text-slate-200 hover:text-rose-700 dark:hover:text-rose-300 border border-slate-300 dark:border-slate-700'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
            }`}
          >
            {isEnabled ? 'Disable AI Assist' : 'Enable AI Assist'}
          </button>
        </div>
      </div>

      {detailsOpen && (
        <div className="mt-3 pt-3 border-t border-indigo-100/80 dark:border-indigo-900/50 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-600 dark:text-slate-300 animate-fadeIn">
          <div className="flex items-start gap-2 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-indigo-50 dark:border-indigo-900/40">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800 dark:text-slate-200 block">Full User Control</strong>
              Never auto-replaces without your say. Review side-by-side and click [Apply] or [Keep Original].
            </div>
          </div>

          <div className="flex items-start gap-2 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-indigo-50 dark:border-indigo-900/40">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800 dark:text-slate-200 block">Technical Term Safety</strong>
              Preserves technical terms (React, APIs, Firebase, Python, SQL, Docker) and proper nouns safely.
            </div>
          </div>

          <div className="flex items-start gap-2 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-indigo-50 dark:border-indigo-900/40">
            <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800 dark:text-slate-200 block">Private Draft Analysis</strong>
              Draft text is analyzed live in memory and is never permanently saved until you submit the form.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
