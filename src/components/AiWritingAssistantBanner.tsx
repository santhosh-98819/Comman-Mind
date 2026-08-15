import React, { useState } from 'react';
import { Sparkles, Shield, Info, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
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
    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-slate-50 to-purple-50/70 border border-indigo-100/90 text-xs shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">AI Writing Assistant</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isEnabled
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {isEnabled ? 'Active & Ready' : 'Turned Off'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Assists with real-time spelling, grammar, and constructive tone without altering your original meaning.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDetailsOpen(!detailsOpen)}
            className="text-[11px] text-indigo-700 hover:text-indigo-900 flex items-center gap-1 font-medium cursor-pointer"
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
                ? 'bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
            }`}
          >
            {isEnabled ? 'Disable AI Assist' : 'Enable AI Assist'}
          </button>
        </div>
      </div>

      {detailsOpen && (
        <div className="mt-3 pt-3 border-t border-indigo-100/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-600 animate-fadeIn">
          <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-indigo-50">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800 block">Full User Control</strong>
              Never auto-replaces. You review and click [Apply] or [Ignore] on every suggestion.
            </div>
          </div>

          <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-indigo-50">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800 block">Technical Term Safety</strong>
              Preserves technical terms (React, APIs, Firebase, Python, SQL) and proper nouns safely.
            </div>
          </div>

          <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-indigo-50">
            <Shield className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800 block">Private Draft Analysis</strong>
              Draft text is analyzed live for suggestions and is never permanently saved until you submit.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
