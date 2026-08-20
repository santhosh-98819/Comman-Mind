import React, { useState } from 'react';
import {
  Sparkles,
  Compass,
  PlusCircle,
  CheckSquare,
  LayoutDashboard,
  Menu,
  X,
  HelpCircle,
  LogIn,
  UserPlus,
  LogOut,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Tooltip } from './Tooltip';
import { ViewMode } from '../App';

interface NavbarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  activeSolutionsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { currentUser, userProfile, isGuest, logout } = useAuth();
  const { themePreference, resolvedTheme, setThemePreference, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home' as ViewMode, label: 'Home', icon: Compass, tooltip: 'Return to Common Mind homepage' },
    { id: 'ask' as ViewMode, label: 'Ask Common Mind', icon: Sparkles, highlight: true, tooltip: 'Get AI recommendations grounded in real human trials' },
    { id: 'experiences' as ViewMode, label: 'Experiences', icon: Compass, tooltip: 'Explore community experiences and what others learned' },
    { id: 'solutions' as ViewMode, label: 'My Solutions', icon: CheckSquare, tooltip: 'Track your active action plans and testing outcomes' },
    { id: 'dashboard' as ViewMode, label: 'Dashboard', icon: LayoutDashboard, tooltip: 'Your personal problem-solving dashboard and impact metrics' },
  ];

  const handleNav = (id: ViewMode) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    onNavigate('home');
  };

  const displayName = userProfile?.displayName || userProfile?.name || currentUser?.displayName || 'Profile';
  const initialLetter = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo Brand */}
          <div
            id="brand-logo-btn"
            onClick={() => handleNav('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 dark:from-indigo-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center text-white shadow-sm ring-1 ring-slate-800/10 dark:ring-white/10 group-hover:scale-105 transition-transform duration-200">
              <div className="relative">
                <span className="font-serif font-black text-lg tracking-tight">CM</span>
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                  COMMON MIND
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 uppercase tracking-wider border border-indigo-100 dark:border-indigo-800/60 hidden sm:inline-block">
                  AI + Experience
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-tight hidden md:block">
                Real Experiences. Real Solutions.
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              if (item.highlight) {
                return (
                  <Tooltip key={item.id} content={item.tooltip} position="bottom">
                    <button
                      id={`nav-btn-${item.id}`}
                      onClick={() => handleNav(item.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-indigo-200 dark:shadow-indigo-950 ring-2 ring-indigo-600 ring-offset-2 dark:ring-offset-slate-900'
                          : 'bg-slate-900 dark:bg-indigo-600 text-white hover:bg-indigo-700 dark:hover:bg-indigo-500 hover:shadow'
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
                    onClick={() => handleNav(item.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/50 font-bold border border-indigo-100 dark:border-indigo-800/60'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                </Tooltip>
              );
            })}
          </nav>

          {/* User Account & Theme Toggle Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Desktop Theme Switcher Button */}
            <Tooltip
              content={
                themePreference === 'system'
                  ? `Theme: System (${resolvedTheme === 'dark' ? 'Dark' : 'Light'}). Click to toggle.`
                  : `Theme: ${resolvedTheme === 'dark' ? 'Dark' : 'Light'}. Click to toggle.`
              }
              position="bottom"
            >
              <button
                id="desktop-theme-toggle-btn"
                onClick={toggleTheme}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400 animate-fadeIn" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-600 animate-fadeIn" />
                )}
              </button>
            </Tooltip>

            {/* Get Started Button */}
            <Tooltip content="Interactive 8-step guide to how Common Mind works" position="bottom">
              <button
                id="get-started-nav-btn"
                onClick={() => handleNav('onboarding')}
                className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/60 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Get Started</span>
              </button>
            </Tooltip>

            {/* Share Experience Button */}
            <Tooltip content="Share what you tried, what happened, and what you learned to help future users" position="bottom">
              <button
                id="share-exp-nav-btn"
                onClick={() => handleNav('share-experience')}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                <span>Share Experience</span>
              </button>
            </Tooltip>

            {currentUser && !isGuest ? (
              <div className="flex items-center gap-2">
                <Tooltip content="View and edit your personal profile and preferences" position="bottom">
                  <button
                    id="user-profile-nav-btn"
                    onClick={() => handleNav('profile')}
                    className={`group relative overflow-hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border shadow-2xs transition-all cursor-pointer ${
                      currentView === 'profile'
                        ? 'border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-600 ring-offset-1 dark:ring-offset-slate-900 text-white'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-white'
                    }`}
                  >
                    {/* User Banner Backdrop */}
                    {userProfile?.bannerURL ? (
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundImage: `url(${userProfile.bannerURL})` }}
                      >
                        <div className="absolute inset-0 bg-slate-950/65 dark:bg-slate-950/75 backdrop-blur-[0.5px]" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 opacity-95 transition-transform duration-500 group-hover:scale-105">
                        <div className="absolute inset-0 bg-slate-950/40" />
                      </div>
                    )}

                    <div className="relative z-10 flex items-center gap-2">
                      {userProfile?.photoURL ? (
                        <img
                          src={userProfile.photoURL}
                          alt="Avatar"
                          referrerPolicy="no-referrer"
                          className="w-6 h-6 rounded-full object-cover border-2 border-white/80 dark:border-slate-200 shadow-xs flex-shrink-0"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs ring-1 ring-white/70 shadow-xs flex-shrink-0">
                          {initialLetter}
                        </div>
                      )}
                      <span className="max-w-[110px] truncate hidden sm:inline-block font-bold text-white drop-shadow-xs">
                        {displayName}
                      </span>
                    </div>
                  </button>
                </Tooltip>

                <Tooltip content="Sign out of your Common Mind account" position="bottom">
                  <button
                    id="nav-logout-btn"
                    onClick={handleLogout}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Log In</span>
                </button>

                <button
                  id="nav-signup-btn"
                  onClick={() => handleNav('signup')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 shadow-2xs transition-all cursor-pointer"
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
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-5 space-y-2 shadow-lg animate-fadeIn">
          {/* Mobile Profile Pill for quick access */}
          {currentUser && !isGuest && (
            <button
              id="mobile-profile-direct-btn"
              onClick={() => handleNav('profile')}
              className={`group relative overflow-hidden w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                currentView === 'profile'
                  ? 'border-indigo-400 ring-2 ring-indigo-500 shadow-md'
                  : 'border-slate-200 dark:border-slate-700 shadow-xs hover:border-slate-300'
              }`}
            >
              {/* Mobile Drawer Banner Background */}
              {userProfile?.bannerURL ? (
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${userProfile.bannerURL})` }}
                >
                  <div className="absolute inset-0 bg-slate-950/70 dark:bg-slate-950/80 backdrop-blur-[0.5px]" />
                </div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 opacity-95">
                  <div className="absolute inset-0 bg-slate-950/50" />
                </div>
              )}

              <div className="relative z-10 flex items-center gap-3">
                {userProfile?.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt="Avatar"
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-xl object-cover border-2 border-white/90 shadow-md flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-white/70 flex-shrink-0">
                    {initialLetter}
                  </div>
                )}
                <div className="text-left">
                  <p className="font-bold text-sm leading-tight text-white drop-shadow-xs">{displayName}</p>
                  <p className="text-[11px] text-slate-200/80 drop-shadow-xs truncate max-w-[170px]">{currentUser.email || 'Common Mind Member'}</p>
                </div>
              </div>
              <span className="relative z-10 text-xs font-bold text-white bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/30 shadow-xs">
                View Profile
              </span>
            </button>
          )}

          {/* Mobile Appearance / Theme Control Segmented Switcher */}
          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between px-1 text-xs font-bold text-slate-600 dark:text-slate-300">
              <span>Theme / Appearance</span>
              <span className="text-[10px] font-semibold text-slate-400 capitalize">{themePreference}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => setThemePreference('light')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                  themePreference === 'light'
                    ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-xs ring-1 ring-slate-300 dark:ring-slate-600'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light</span>
              </button>

              <button
                onClick={() => setThemePreference('dark')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                  themePreference === 'dark'
                    ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Dark</span>
              </button>

              <button
                onClick={() => setThemePreference('system')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                  themePreference === 'system'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs ring-1 ring-slate-300 dark:ring-slate-600'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50'
                }`}
              >
                <Monitor className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>System</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => handleNav('onboarding')}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60"
          >
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Get Started (Interactive Guide)</span>
            </div>
            <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-semibold">
              Tour
            </span>
          </button>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-100 dark:border-indigo-800/60'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`} />
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

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => handleNav('share-experience')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Share What You Learned</span>
            </button>

            {!currentUser || isGuest ? (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleNav('login')}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-center"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNav('signup')}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-center"
                >
                  Sign Up
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-center flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out ({displayName})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
