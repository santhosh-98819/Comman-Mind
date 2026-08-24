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
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Tooltip } from './Tooltip';
import { ViewMode } from '../App';
import { UserProfile } from '../types';

interface NavbarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  user?: UserProfile;
  onOpenAuth?: () => void;
  activeSolutionsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  activeSolutionsCount = 0,
}) => {
  const { currentUser, userProfile, isGuest, logout } = useAuth();
  const { themePreference, resolvedTheme, setThemePreference, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: {
    id: ViewMode;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    tooltip: string;
    badgeCount?: number;
  }[] = [
    { id: 'home', label: 'Home', icon: Compass, tooltip: 'Home - Community problems and solutions' },
    {
      id: 'ask',
      label: 'Ask Common Mind',
      icon: Sparkles,
      tooltip: 'Get AI recommendations grounded in real human trials',
    },
    { id: 'experiences', label: 'Stories', icon: BookOpen, tooltip: 'Browse verified peer experiences' },
    {
      id: 'solutions',
      label: 'My Plans',
      icon: CheckSquare,
      tooltip: 'Track your active action plans and outcomes',
      badgeCount: activeSolutionsCount > 0 ? activeSolutionsCount : undefined,
    },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, tooltip: 'Your personal problem-solving dashboard' },
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
  const bannerURL = userProfile?.bannerURL;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-4 md:gap-6 lg:gap-8">
          {/* Left: Brand Logo & Title */}
          <div
            id="brand-logo-btn"
            onClick={() => handleNav('home')}
            className="flex items-center gap-3 cursor-pointer group select-none flex-shrink-0"
          >
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-indigo-900 dark:from-indigo-950 dark:via-slate-900 dark:to-indigo-900 flex items-center justify-center text-white shadow-xs ring-1 ring-slate-800/10 dark:ring-white/15 group-hover:scale-105 transition-transform duration-200">
              <span className="font-serif font-black text-sm tracking-tight text-indigo-100">CM</span>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-900" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white">
                COMMON MIND
              </span>
              <span className="hidden xl:inline-block text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-800/50 uppercase tracking-wider">
                AI + Human Data
              </span>
            </div>
          </div>

          {/* Center: Normal & Spaced Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3 flex-1 justify-center max-w-2xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <Tooltip key={item.id} content={item.tooltip} position="bottom">
                  <button
                    id={`nav-btn-${item.id}`}
                    onClick={() => handleNav(item.id)}
                    className={`relative inline-flex items-center gap-2 px-3 py-2 lg:px-3.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/90 dark:bg-indigo-950/70 font-semibold shadow-2xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    />
                    <span>{item.label}</span>
                    {item.badgeCount !== undefined && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                        {item.badgeCount}
                      </span>
                    )}
                  </button>
                </Tooltip>
              );
            })}
          </nav>

          {/* Right: Actions, Theme & User Auth with Generous Spacing */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Quick Share Button */}
            <Tooltip content="Share a challenge you faced and what you learned" position="bottom">
              <button
                id="share-exp-nav-btn"
                onClick={() => handleNav('share-experience')}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 transition-colors cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Share</span>
              </button>
            </Tooltip>

            {/* Quick Tour Button */}
            <Tooltip content="Interactive 8-step guide to how Common Mind works" position="bottom">
              <button
                id="get-started-nav-btn"
                onClick={() => handleNav('onboarding')}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer hidden sm:flex items-center justify-center"
                aria-label="How it works tour"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </Tooltip>

            {/* Theme Toggle Button with Motion */}
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
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
              >
                <motion.div
                  key={resolvedTheme}
                  initial={{ rotate: -30, opacity: 0, scale: 0.8 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {resolvedTheme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-indigo-600" />
                  )}
                </motion.div>
              </button>
            </Tooltip>

            {/* User Profile Pill with Banner Theme Styling */}
            {currentUser && !isGuest ? (
              <div className="flex items-center gap-2">
                <Tooltip content="View personal profile and saved solutions" position="bottom">
                  <button
                    id="user-profile-nav-btn"
                    onClick={() => handleNav('profile')}
                    className={`relative group overflow-hidden inline-flex items-center gap-2.5 px-3 py-1.5 rounded-2xl text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
                      currentView === 'profile'
                        ? 'border-indigo-500 ring-2 ring-indigo-400/40 text-white'
                        : 'border-slate-300/80 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 text-white'
                    }`}
                  >
                    {/* Banner Theme Background */}
                    {bannerURL ? (
                      <div className="absolute inset-0 z-0">
                        <img
                          src={bannerURL}
                          alt="Banner Theme"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-slate-950/65 group-hover:bg-slate-950/50 backdrop-blur-[0.5px] transition-colors" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 z-0 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 group-hover:from-indigo-950 group-hover:to-slate-900 transition-colors" />
                    )}

                    {/* Avatar with Glow Ring */}
                    <div className="relative z-10 flex-shrink-0">
                      {userProfile?.photoURL ? (
                        <img
                          src={userProfile.photoURL}
                          alt="Avatar"
                          referrerPolicy="no-referrer"
                          className="w-6 h-6 rounded-full object-cover border border-white/80 shadow-xs"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px] border border-white/80 shadow-xs">
                          {initialLetter}
                        </div>
                      )}
                    </div>

                    {/* Display Name & Subtle Badge */}
                    <div className="relative z-10 text-left leading-tight hidden sm:block">
                      <span className="max-w-[100px] truncate block text-xs font-bold text-white tracking-tight drop-shadow-xs">
                        {displayName}
                      </span>
                    </div>
                  </button>
                </Tooltip>

                <Tooltip content="Sign out" position="bottom">
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
              <div className="flex items-center gap-2.5">
                <button
                  id="nav-login-btn"
                  onClick={() => handleNav('login')}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Log In
                </button>

                <button
                  id="nav-signup-btn"
                  onClick={() => handleNav('signup')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 shadow-2xs transition-all cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Join</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Animated Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 pt-3 pb-5 space-y-3 shadow-xl overflow-hidden"
          >
            {/* Quick Profile Banner Pill in Mobile Drawer */}
            {currentUser && !isGuest && (
              <div
                onClick={() => handleNav('profile')}
                className="relative overflow-hidden flex items-center justify-between p-3.5 rounded-2xl border border-slate-300/80 dark:border-slate-700 cursor-pointer group shadow-sm"
              >
                {/* Banner background */}
                {bannerURL ? (
                  <div className="absolute inset-0 z-0">
                    <img
                      src={bannerURL}
                      alt="Banner Theme"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-slate-950/70" />
                  </div>
                ) : (
                  <div className="absolute inset-0 z-0 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900" />
                )}

                <div className="relative z-10 flex items-center gap-3">
                  {userProfile?.photoURL ? (
                    <img
                      src={userProfile.photoURL}
                      alt="Avatar"
                      className="w-9 h-9 rounded-full object-cover border-2 border-white/80 shadow-xs"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs border-2 border-white/80 shadow-xs">
                      {initialLetter}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">{displayName}</p>
                    <p className="text-[11px] text-slate-300 truncate max-w-[180px]">
                      {currentUser.email || 'Common Mind Member'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/80 relative z-10" />
              </div>
            )}

            {/* Mobile Nav Links */}
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-100 dark:border-indigo-800/60'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badgeCount !== undefined && (
                      <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded-full">
                        {item.badgeCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mobile Actions: Share & Tour */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleNav('share-experience')}
                className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                <PlusCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Share Story</span>
              </button>

              <button
                onClick={() => handleNav('onboarding')}
                className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Guide / Tour</span>
              </button>
            </div>

            {/* Theme switcher */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-300">Theme</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setThemePreference('light')}
                  className={`px-2 py-1 rounded-lg font-bold text-[11px] ${
                    themePreference === 'light'
                      ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-2xs'
                      : 'text-slate-500'
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => setThemePreference('dark')}
                  className={`px-2 py-1 rounded-lg font-bold text-[11px] ${
                    themePreference === 'dark'
                      ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-500'
                  }`}
                >
                  Dark
                </button>
                <button
                  onClick={() => setThemePreference('system')}
                  className={`px-2 py-1 rounded-lg font-bold text-[11px] ${
                    themePreference === 'system'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                      : 'text-slate-500'
                  }`}
                >
                  System
                </button>
              </div>
            </div>

            {/* Mobile Auth action */}
            <div className="pt-1">
              {!currentUser || isGuest ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleNav('login')}
                    className="w-full py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 text-center"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => handleNav('signup')}
                    className="w-full py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 text-center"
                  >
                    Sign Up
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogout}
                  className="w-full py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 text-center flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
