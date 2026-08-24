import React from 'react';
import { Compass, ShieldAlert, Sparkles, Heart, HelpCircle, BookOpen, UserPlus, LogIn } from 'lucide-react';
import { ViewMode } from '../App';

export const Footer: React.FC<{ onNavigate: (view: ViewMode) => void }> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                CM
              </div>
              <span className="font-semibold text-lg text-white tracking-tight">COMMON MIND</span>
            </div>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              Real Experiences. Real Solutions.
              <br />
              <strong className="text-slate-300">"Common"</strong> represents collective human experience.
              <strong className="text-slate-300"> "Mind"</strong> represents intelligence, reasoning, learning, and decision-making.
            </p>
            <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700/60 max-w-md">
              <p className="text-xs text-slate-300 font-medium italic">
                “Information tells you what is possible. Experience tells you what happened. Common Mind combines experience with AI reasoning to help you decide what to do next.”
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5">
              Explore Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('onboarding')}
                  className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Get Started (Guide)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Home & Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('ask')}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Ask Common Mind</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-900/80 text-indigo-300 border border-indigo-700">
                    Core Flow
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('experiences')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Experience Database
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('share-experience')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Share What You Learned
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('solutions')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  My Solutions & Feedback
                </button>
              </li>
            </ul>
          </div>

          {/* Core Distinctions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5">
              Trust & Transparency
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400 mt-1 flex-shrink-0" />
                <span><strong>Human Experience:</strong> What people actually tried and reported.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400 mt-1 flex-shrink-0" />
                <span><strong>AI Analysis:</strong> Patterns detected across outcome data.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1 flex-shrink-0" />
                <span><strong>Personalized Plan:</strong> Synthesized recommendation for your constraints.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 mt-1 flex-shrink-0" />
                <span><strong>Uncertainty:</strong> Transparent disclosure of limits and assumptions.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Safety Banner */}
        <div className="pt-6 border-t border-slate-800 text-xs text-slate-400 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Disclaimer:</strong> Common Mind presents peer experiences and probabilistic AI reasoning. It does not replace certified professional, medical, legal, or fiduciary counsel.
            </span>
          </div>
          <div className="flex gap-4 text-[11px] text-slate-500">
            <button onClick={() => onNavigate('privacy-policy')} className="hover:text-white transition-colors">Privacy Policy</button>
            <button onClick={() => onNavigate('terms-and-conditions')} className="hover:text-white transition-colors">Terms & Conditions</button>
            <button onClick={() => onNavigate('community-guidelines')} className="hover:text-white transition-colors">Community Guidelines</button>
          </div>
          <div className="text-[11px] text-slate-400 flex-shrink-0">
            © {new Date().getFullYear()} Common Mind. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
