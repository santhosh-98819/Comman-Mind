import React, { useState } from 'react';
import { Sparkles, Compass, PlusCircle, CheckSquare, LayoutDashboard, User, Menu, X, HelpCircle, LogIn, UserPlus, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Tooltip } from './Tooltip';
import { ViewMode } from '../App';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: ViewMode) => void;
  activeSolutionsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { currentUser, userProfile, isGuest, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Compass, tooltip: 'Return to Common Mind homepage' },
    { id: 'ask', label: 'Ask Common Mind', icon: Sparkles, highlight: true, tooltip: 'Get AI recommendations grounded in real human trials' },
    { id: 'experiences', label: 'Experiences', icon: Compass, tooltip: 'Explore community experiences and what others learned' },
    { id: 'solutions', label: 'My Solutions', icon: CheckSquare, tooltip: 'Track your active action plans and testing outcomes' },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, tooltip: 'Your personal problem-solving dashboard and impact metrics' },
  ];

  const handleNav = (id: ViewMode) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    onNavigate('home');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo Brand */}
          <div
            id="brand-logo-btn"
            onClick={() => handleNav('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center text-white shadow-sm ring-1 ring-slate-800/10 group-hover:scale-105 transition-transform duration-200">
              <div className="relative">
                <span className="font-serif font-black text-lg tracking-tight">CM</span>
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-base sm:text-lg tracking-tight text-slate-900">
                  COMMON MIND
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase tracking-wider border border-indigo-100 hidden sm:inline-block">
                  AI + Experience
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium tracking-tight hidden md:block">
                Real Experiences. Real Solutions.
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              if (item.highlight) {
                return (
                  <Tooltip key={item.id} content={item.tooltip} position="bottom">
                    <button
                      id={`nav-btn-${item.id}`}
                      onClick={() => handleNav(item.id as ViewMode)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-indigo-200 ring-2 ring-indigo-600 ring-offset-2'
                          : 'bg-slate-900 text-white hover:bg-indigo-700 hover:shadow'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-emerald-300" />
                      <span>{item.label}</span>
                    </button>
                  </Tooltip>
                );
              }
              return (
                <Tooltip key={item.id} content={item.tooltip} position="bottom">
                  <button
                    id={`nav-btn-${item.id}`}
                    onClick={() => handleNav(item.id as ViewMode)}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'text-indigo-600 bg-indigo-50/70 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    {item.label}
                  </button>
                </Tooltip>
              );
            })}
          </nav>

          {/* User Account / Entry Points (Get Started, Log In, Sign Up) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Get Started Button with Tooltip */}
            <Tooltip content="Interactive 8-step guide to how Common Mind works" position="bottom">
              <button
                id="get-started-nav-btn"
                onClick={() => handleNav('onboarding')}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                <span>Get Started</span>
              </button>
            </Tooltip>

            {/* Share Experience with Tooltip */}
            <Tooltip content="Share what you tried, what happened, and what you learned to help future users" position="bottom">
              <button
                id="share-exp-nav-btn"
                onClick={() => handleNav('share-experience')}
                className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-colors cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-slate-600" />
                <span>Share Experience</span>
              </button>
            </Tooltip>

            {currentUser && !isGuest ? (
              <div className="flex items-center gap-2">
                <button
                  id="user-profile-nav-btn"
                  onClick={() => handleNav('dashboard')}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {(userProfile?.name || currentUser.displayName || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate hidden sm:inline-block font-semibold text-slate-800">
                    {userProfile?.name || currentUser.displayName || 'Account'}
                  </span>
                </button>

                <Tooltip content="Sign out of your Common Mind account" position="bottom">
                  <button
                    id="nav-logout-btn"
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </Tooltip>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  id="nav-login-btn"
                  onClick={() => handleNav('login')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-500" />
                  <span>Log In</span>
                </button>

                <button
                  id="nav-signup-btn"
                  onClick={() => handleNav('signup')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-2xs transition-all cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-1 shadow-lg">
          <button
            onClick={() => handleNav('onboarding')}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-bold text-indigo-700 bg-indigo-50"
          >
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span>Get Started (Guide)</span>
            </div>
            <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-semibold">
              New
            </span>
          </button>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id as ViewMode)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{item.label}</span>
                </div>
                {item.highlight && (
                  <span className="text-[10px] bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-full">
                    Solve
                  </span>
                )}
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => handleNav('share-experience')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Share What You Learned</span>
            </button>

            {!currentUser || isGuest ? (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleNav('login')}
                  className="w-full py-2 rounded-lg text-xs font-bold text-slate-800 bg-slate-100 text-center"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNav('signup')}
                  className="w-full py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 text-center"
                >
                  Sign Up
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full py-2 rounded-lg text-xs font-bold text-rose-600 bg-rose-50 text-center"
              >
                Log Out ({userProfile?.name || 'Account'})
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
