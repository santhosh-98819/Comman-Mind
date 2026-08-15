import React, { useState, useEffect, useRef, useId } from 'react';
import { Sparkles, Check, X, CheckCheck, HelpCircle, Shield, AlertTriangle, ArrowRight, CornerDownLeft } from 'lucide-react';
import { WritingSuggestion, WritingAssistResponse } from '../types';
import { assistWriting } from '../services/api';
import { useWritingAssist } from '../contexts/WritingAssistContext';
import { Tooltip } from './Tooltip';

interface AiWritingFieldProps {
  id: string;
  type?: 'textarea' | 'input';
  label?: string;
  labelExtra?: React.ReactNode;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  fieldName: string;
  fieldCategoryContext?: string;
  className?: string;
  inputClassName?: string;
  helperText?: string;
}

export const AiWritingField: React.FC<AiWritingFieldProps> = ({
  id,
  type = 'textarea',
  label,
  labelExtra,
  required = false,
  value,
  onChange,
  placeholder,
  rows = 3,
  fieldName,
  fieldCategoryContext,
  className = '',
  inputClassName = '',
  helperText,
}) => {
  const { isEnabled, toggleEnabled } = useWritingAssist();
  const [status, setStatus] = useState<'idle' | 'checking' | 'has_suggestions' | 'clean'>('idle');
  const [suggestions, setSuggestions] = useState<WritingSuggestion[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [cleanText, setCleanText] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showCard, setShowCard] = useState(true);
  const [privacyTooltipOpen, setPrivacyTooltipOpen] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckedTextRef = useRef<string>('');
  const clientCacheRef = useRef<Map<string, WritingAssistResponse>>(new Map());

  useEffect(() => {
    if (!isEnabled) {
      setStatus('idle');
      setSuggestions([]);
      return;
    }

    const trimmed = value.trim();

    // Reset if text is too short (at least 5 characters or contains space)
    if (trimmed.length < 5) {
      setStatus('idle');
      setSuggestions([]);
      setCleanText(null);
      return;
    }

    // Skip if unchanged since last check
    if (trimmed === lastCheckedTextRef.current) {
      return;
    }

    // Check client-side memory cache first
    const cacheKey = `${fieldName}:${trimmed.toLowerCase()}`;
    const cachedResponse = clientCacheRef.current.get(cacheKey);
    if (cachedResponse) {
      lastCheckedTextRef.current = trimmed;
      if (cachedResponse.hasSuggestions && cachedResponse.suggestions.length > 0) {
        const activeSuggestions = cachedResponse.suggestions.filter(
          (s) => !dismissedIds.has(s.id) && !dismissedIds.has(`${s.original}-${s.suggested}`)
        );
        if (activeSuggestions.length > 0) {
          setSuggestions(activeSuggestions);
          setCleanText(cachedResponse.cleanText || null);
          setStatus('has_suggestions');
          setShowCard(true);
        } else {
          setSuggestions([]);
          setStatus('clean');
        }
      } else {
        setSuggestions([]);
        setStatus('clean');
      }
      return;
    }

    setStatus('checking');

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      lastCheckedTextRef.current = trimmed;
      try {
        const response: WritingAssistResponse = await assistWriting(
          trimmed,
          fieldName,
          fieldCategoryContext
        );

        // Store in client-side cache
        clientCacheRef.current.set(cacheKey, response);

        if (response.hasSuggestions && response.suggestions.length > 0) {
          // Filter out previously dismissed suggestions
          const activeSuggestions = response.suggestions.filter(
            (s) => !dismissedIds.has(s.id) && !dismissedIds.has(`${s.original}-${s.suggested}`)
          );

          if (activeSuggestions.length > 0) {
            setSuggestions(activeSuggestions);
            setCleanText(response.cleanText || null);
            setStatus('has_suggestions');
            setShowCard(true);
          } else {
            setSuggestions([]);
            setStatus('clean');
          }
        } else {
          setSuggestions([]);
          setStatus('clean');
        }
      } catch (err) {
        setStatus('idle');
      }
    }, 1000);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value, isEnabled, fieldName, fieldCategoryContext, dismissedIds]);

  const handleApplySingle = (suggestion: WritingSuggestion) => {
    let newText = value;

    if (value.includes(suggestion.original)) {
      // Replace only the first occurrence or exact match
      newText = value.replace(suggestion.original, suggestion.suggested);
    } else {
      // If it's a whole sentence suggestion or fuzzy match
      const lowerVal = value.toLowerCase();
      const lowerOrig = suggestion.original.toLowerCase();
      const idx = lowerVal.indexOf(lowerOrig);
      if (idx !== -1) {
        newText =
          value.substring(0, idx) +
          suggestion.suggested +
          value.substring(idx + suggestion.original.length);
      } else {
        newText = suggestion.suggested;
      }
    }

    onChange(newText);
    lastCheckedTextRef.current = newText.trim();

    // Mark dismissed/handled
    setDismissedIds((prev) => {
      const updated = new Set(prev);
      updated.add(suggestion.id);
      updated.add(`${suggestion.original}-${suggestion.suggested}`);
      return updated;
    });

    const remaining = suggestions.filter((s) => s.id !== suggestion.id);
    setSuggestions(remaining);
    if (remaining.length === 0) {
      setStatus('clean');
    }
  };

  const handleApplyAll = () => {
    let newText = cleanText || value;

    if (!cleanText) {
      for (const s of suggestions) {
        if (newText.includes(s.original)) {
          newText = newText.replace(s.original, s.suggested);
        }
      }
    }

    onChange(newText);
    lastCheckedTextRef.current = newText.trim();

    // Dismiss all
    setDismissedIds((prev) => {
      const updated = new Set(prev);
      suggestions.forEach((s) => {
        updated.add(s.id);
        updated.add(`${s.original}-${s.suggested}`);
      });
      return updated;
    });

    setSuggestions([]);
    setStatus('clean');
  };

  const handleDismissSingle = (suggestion: WritingSuggestion) => {
    setDismissedIds((prev) => {
      const updated = new Set(prev);
      updated.add(suggestion.id);
      updated.add(`${suggestion.original}-${suggestion.suggested}`);
      return updated;
    });

    const remaining = suggestions.filter((s) => s.id !== suggestion.id);
    setSuggestions(remaining);
    if (remaining.length === 0) {
      setStatus('clean');
    }
  };

  const handleDismissAll = () => {
    setDismissedIds((prev) => {
      const updated = new Set(prev);
      suggestions.forEach((s) => {
        updated.add(s.id);
        updated.add(`${s.original}-${s.suggested}`);
      });
      return updated;
    });
    setSuggestions([]);
    setStatus('clean');
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label and Assistant Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5">
          {label && (
            <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-slate-800">
              {label} {required && <span className="text-rose-500">*</span>}
            </label>
          )}
          {labelExtra}
        </div>

        {/* AI Assistant Status Indicator & Toggle */}
        <div className="flex items-center gap-2">
          {isEnabled ? (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all">
              {status === 'checking' ? (
                <span className="flex items-center gap-1 text-indigo-600 bg-indigo-50/90 px-2 py-0.5 rounded-full border border-indigo-200">
                  <Sparkles className="w-3 h-3 animate-spin" />
                  <span>Checking...</span>
                </span>
              ) : status === 'has_suggestions' ? (
                <button
                  type="button"
                  onClick={() => setShowCard(!showCard)}
                  className="flex items-center gap-1 text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200 cursor-pointer shadow-2xs"
                  title="Click to toggle suggestions"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>
                    {suggestions.length} {suggestions.length === 1 ? 'Suggestion' : 'Suggestions'} Available
                  </span>
                </button>
              ) : (
                <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  <span className="hidden sm:inline">AI Writing Assist</span>
                  <span className="sm:hidden">AI Assist</span>
                </span>
              )}

              {/* Toggle switch button */}
              <Tooltip content="Turn AI Writing Assistant Off" position="top">
                <button
                  type="button"
                  onClick={toggleEnabled}
                  id={`${id}-assist-toggle`}
                  className="text-[10px] text-slate-400 hover:text-slate-700 px-1 hover:underline cursor-pointer"
                >
                  [ON]
                </button>
              </Tooltip>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 text-[11px] text-slate-400">
              <span className="hidden sm:inline">AI Assist: Off</span>
              <Tooltip content="Turn ON Real-Time AI Writing Assistant" position="top">
                <button
                  type="button"
                  onClick={toggleEnabled}
                  id={`${id}-assist-toggle-on`}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 cursor-pointer"
                >
                  Turn ON
                </button>
              </Tooltip>
            </div>
          )}
        </div>
      </div>

      {/* Input or Textarea element */}
      <div className="relative">
        {type === 'textarea' ? (
          <textarea
            id={id}
            rows={rows}
            required={required}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className={`w-full text-sm p-3 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all placeholder:text-slate-400 ${
              suggestions.length > 0 ? 'border-amber-300/90' : ''
            } ${inputClassName}`}
          />
        ) : (
          <input
            type="text"
            id={id}
            required={required}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className={`w-full text-sm p-3 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all placeholder:text-slate-400 ${
              suggestions.length > 0 ? 'border-amber-300/90' : ''
            } ${inputClassName}`}
          />
        )}
      </div>

      {/* Helper text if provided */}
      {helperText && <p className="text-[11px] text-slate-500">{helperText}</p>}

      {/* ====================================================
          SUBTLE, NON-DISRUPTIVE AI SUGGESTION CARDS
          User control: [Apply] / [Ignore] - Never auto-replace
         ==================================================== */}
      {isEnabled && suggestions.length > 0 && showCard && (
        <div className="p-3.5 bg-amber-50/90 rounded-xl border border-amber-200/90 shadow-xs space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-amber-200/70 pb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span className="text-xs font-bold text-amber-950">
                AI Writing Suggestions ({suggestions.length})
              </span>
            </div>

            <div className="flex items-center gap-2">
              {suggestions.length > 1 && (
                <button
                  type="button"
                  onClick={handleApplyAll}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                >
                  <CheckCheck className="w-3 h-3" />
                  <span>Apply All</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleDismissAll}
                className="text-[11px] text-amber-800/80 hover:text-amber-950 hover:underline cursor-pointer"
              >
                Dismiss All
              </button>
            </div>
          </div>

          {/* List of individual suggestions */}
          <div className="space-y-2.5">
            {suggestions.map((suggestion) => {
              const isAlternative = suggestion.type === 'alternative_wording';

              return (
                <div
                  key={suggestion.id}
                  className="p-2.5 rounded-lg bg-white border border-amber-200 text-xs space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isAlternative
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      }`}
                    >
                      {isAlternative ? 'Alternative Tone Wording' : 'Typo / Grammar Correction'}
                    </span>

                    <span className="text-[11px] text-slate-500 italic">
                      {suggestion.reason}
                    </span>
                  </div>

                  {/* Original vs Suggested Comparison */}
                  <div className="space-y-1 bg-slate-50 p-2 rounded-md border border-slate-200/70">
                    <div className="text-slate-600 flex items-start gap-1.5">
                      <span className="text-slate-400 font-semibold flex-shrink-0">Original:</span>
                      <span className="line-through text-rose-700 bg-rose-50 px-1 rounded">
                        "{suggestion.original}"
                      </span>
                    </div>
                    <div className="text-slate-900 font-medium flex items-start gap-1.5">
                      <span className="text-indigo-700 font-bold flex-shrink-0">
                        {isAlternative ? 'Alternative:' : 'Did you mean:'}
                      </span>
                      <span className="text-emerald-800 bg-emerald-50 px-1 rounded font-semibold">
                        "{suggestion.suggested}"
                      </span>
                    </div>
                  </div>

                  {/* Actions: [Apply] [Ignore] */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleDismissSingle(suggestion)}
                      className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                    >
                      {isAlternative ? 'Keep Original' : 'Ignore'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplySingle(suggestion)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-[11px] font-bold text-white bg-slate-900 hover:bg-indigo-700 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>{isAlternative ? 'Use Alternative' : 'Apply'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Privacy & non-storage reassurance footnote */}
          <div className="flex items-center justify-between text-[10px] text-amber-800/80 pt-1">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-600" />
              <span>Draft text is analyzed live and never stored without form submission.</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
