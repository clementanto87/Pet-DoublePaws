import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  Menu,
  X,
  Home,
  PawPrint,
  MessageSquare,
  Briefcase,
  Shield,
  ShieldCheck,
  LogOut,
  Sparkles,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Logo } from '../ui/Logo';
import { Wordmark } from '../ui/Wordmark';
import { LanguageDropdown } from '../ui/LanguageDropdown';
import { useAuth } from '../../context/AuthContext';
import { useIsSitter } from '../../hooks/useIsSitter';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuPos, setUserMenuPos] = useState<{ top: number; right: number } | null>(null);

  const userMenuBtnRef = useRef<HTMLButtonElement>(null);
  const { isAuthenticated, logout, user } = useAuth();
  const { isSitter } = useIsSitter();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isSitterRole = isSitter || Boolean(user?.isSitter) || user?.role === 'sitter' || Boolean(user?.sitterProfileId);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  const updateUserMenuPos = useCallback(() => {
    if (userMenuBtnRef.current) {
      const rect = userMenuBtnRef.current.getBoundingClientRect();
      setUserMenuPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
  }, []);

  useEffect(() => {
    if (!isUserMenuOpen) return;
    updateUserMenuPos();
    window.addEventListener('resize', updateUserMenuPos);
    window.addEventListener('scroll', updateUserMenuPos, true);
    return () => {
      window.removeEventListener('resize', updateUserMenuPos);
      window.removeEventListener('scroll', updateUserMenuPos, true);
    };
  }, [isUserMenuOpen, updateUserMenuPos]);

  const handleLogout = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    logout();
    navigate('/', { replace: true });
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const userInitials = (user?.firstName?.[0] || user?.email?.[0] || 'U').toUpperCase();
  const userFullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'User';

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        isScrolled
          ? 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 shadow-sm'
          : 'bg-white/60 dark:bg-slate-950/60 backdrop-blur-md border-b border-transparent'
      )}
    >
      <nav className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-16 md:h-20 min-w-0">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center min-w-0">
            <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group min-w-0">
              <Logo className="w-10 h-8 sm:w-11 sm:h-9 md:w-12 md:h-10 transition-transform group-hover:scale-105 flex-shrink-0" />
              <Wordmark className="text-lg sm:text-xl md:text-2xl" />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/"
              className={cn(
                'px-3.5 py-2 rounded-xl text-sm font-medium transition-colors',
                isActive('/')
                  ? 'bg-orange-50 dark:bg-orange-950/30 text-primary font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              )}
            >
              {t('navigation.home')}
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className={cn(
                    'px-3.5 py-2 rounded-xl text-sm font-medium transition-colors',
                    isActive('/dashboard')
                      ? 'bg-orange-50 dark:bg-orange-950/30 text-primary font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  )}
                >
                  {t('navigation.dashboard')}
                </Link>

                <Link
                  to="/messages"
                  className={cn(
                    'px-3.5 py-2 rounded-xl text-sm font-medium transition-colors',
                    isActive('/messages')
                      ? 'bg-orange-50 dark:bg-orange-950/30 text-primary font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  )}
                >
                  {t('navigation.messages')}
                </Link>
              </>
            )}

            {/* Sitter Link: Sitter Dashboard if sitter, or Become a Sitter if not */}
            {isSitterRole ? (
              <Link
                to="/sitter-dashboard"
                className={cn(
                  'px-3.5 py-2 rounded-xl text-sm font-medium transition-colors',
                  isActive('/sitter-dashboard')
                    ? 'bg-orange-50 dark:bg-orange-950/30 text-primary font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                )}
              >
                {t('navigation.sitterDashboard')}
              </Link>
            ) : (
              <Link
                to="/become-a-sitter"
                className={cn(
                  'px-3.5 py-2 rounded-xl text-sm font-medium transition-colors inline-flex items-center gap-1.5',
                  isActive('/become-a-sitter')
                    ? 'bg-orange-50 dark:bg-orange-950/30 text-primary font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                )}
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>{t('navigation.becomeSitter')}</span>
              </Link>
            )}
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageDropdown />

            {isAuthenticated ? (
              <div className="relative">
                <button
                  ref={userMenuBtnRef}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={cn(
                    'flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border transition-all',
                    isUserMenuOpen
                      ? 'border-primary ring-2 ring-primary/20 bg-orange-50/50 dark:bg-orange-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700'
                  )}
                >
                  <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    {userInitials}
                  </span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
                    {user?.firstName || 'Account'}
                  </span>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-slate-400 transition-transform duration-200',
                      isUserMenuOpen && 'rotate-180 text-primary'
                    )}
                  />
                </button>

                {/* User Dropdown Menu Portal */}
                {isUserMenuOpen && userMenuPos && createPortal(
                  <>
                    <div
                      className="fixed inset-0 z-[9998]"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div
                      style={{ position: 'fixed', top: userMenuPos.top, right: userMenuPos.right }}
                      className="w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-[9999] animate-in fade-in slide-in-from-top-2 duration-150"
                    >
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {userFullName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {user?.email}
                        </p>
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
                            {isAdmin ? '🛡️ Admin' : isSitterRole ? '💼 Sitter' : '🐾 Pet Parent'}
                          </span>
                        </div>
                      </div>

                      {/* Dropdown Links */}
                      <div className="p-1.5 space-y-0.5">
                        <Link
                          to="/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-xl transition-colors',
                            isActive('/dashboard')
                              ? 'bg-orange-50 dark:bg-orange-950/30 text-primary font-semibold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          )}
                        >
                          <PawPrint className="w-4 h-4 text-slate-400" />
                          <span>{t('navigation.dashboard')}</span>
                        </Link>

                        <Link
                          to="/messages"
                          onClick={() => setIsUserMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-xl transition-colors',
                            isActive('/messages')
                              ? 'bg-orange-50 dark:bg-orange-950/30 text-primary font-semibold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          )}
                        >
                          <MessageSquare className="w-4 h-4 text-slate-400" />
                          <span>{t('navigation.messages')}</span>
                        </Link>

                        {isSitterRole ? (
                          <Link
                            to="/sitter-dashboard"
                            onClick={() => setIsUserMenuOpen(false)}
                            className={cn(
                              'flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-xl transition-colors',
                              isActive('/sitter-dashboard')
                                ? 'bg-orange-50 dark:bg-orange-950/30 text-primary font-semibold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            )}
                          >
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            <span>{t('navigation.sitterDashboard')}</span>
                          </Link>
                        ) : (
                          <Link
                            to="/become-a-sitter"
                            onClick={() => setIsUserMenuOpen(false)}
                            className={cn(
                              'flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-xl transition-colors',
                              isActive('/become-a-sitter')
                                ? 'bg-orange-50 dark:bg-orange-950/30 text-primary font-semibold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            )}
                          >
                            <Sparkles className="w-4 h-4 text-orange-500" />
                            <span>{t('navigation.becomeSitter')}</span>
                          </Link>
                        )}

                        <Link
                          to="/settings/privacy"
                          onClick={() => setIsUserMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-xl transition-colors',
                            isActive('/settings/privacy')
                              ? 'bg-orange-50 dark:bg-orange-950/30 text-primary font-semibold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          )}
                        >
                          <Shield className="w-4 h-4 text-slate-400" />
                          <span>{t('navigation.privacySettings')}</span>
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className={cn(
                              'flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-xl transition-colors',
                              isActive('/admin')
                                ? 'bg-orange-50 dark:bg-orange-950/30 text-primary font-semibold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            )}
                          >
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <span>{t('navigation.admin')}</span>
                          </Link>
                        )}
                      </div>

                      {/* Log out button */}
                      <div className="p-1.5 pt-1 border-t border-slate-100 dark:border-slate-800 mt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{t('navigation.logout')}</span>
                        </button>
                      </div>
                    </div>
                  </>,
                  document.body
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="font-semibold">
                    {t('navigation.login')}
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="shadow-glow font-semibold">
                    {t('navigation.signup')}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Controls */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageDropdown />

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-b border-slate-200 dark:border-slate-800 shadow-2xl z-40 max-h-[calc(100vh-4rem)] overflow-y-auto animate-in slide-in-from-top-4 duration-200">
          <div className="p-4 sm:p-6 space-y-5">
            {/* User Profile Card (if logged in) */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <span className="w-11 h-11 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center text-base font-bold shrink-0 shadow-sm">
                  {userInitials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900 dark:text-white truncate">
                    {userFullName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {user?.email}
                  </p>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 shrink-0">
                  {isAdmin ? 'Admin' : isSitterRole ? 'Sitter' : 'Pet Parent'}
                </span>
              </div>
            ) : null}

            {/* Section 1: Main Menu */}
            <div>
              <p className="px-2 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {t('navigation.mainNav', 'Main Menu')}
              </p>
              <div className="space-y-1">
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    isActive('/')
                      ? 'bg-orange-50 dark:bg-orange-950/40 text-primary font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Home className="w-4 h-4 text-slate-400" />
                    <span>{t('navigation.home')}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </Link>

                {isAuthenticated && (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                        isActive('/dashboard')
                          ? 'bg-orange-50 dark:bg-orange-950/40 text-primary font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <PawPrint className="w-4 h-4 text-slate-400" />
                        <span>{t('navigation.dashboard')}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </Link>

                    <Link
                      to="/messages"
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                        isActive('/messages')
                          ? 'bg-orange-50 dark:bg-orange-950/40 text-primary font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-4 h-4 text-slate-400" />
                        <span>{t('navigation.messages')}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Section 2: Sitter Hub */}
            <div>
              <p className="px-2 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {t('navigation.sitterServices', 'Sitter Services')}
              </p>
              <div className="space-y-1">
                {isSitterRole ? (
                  <Link
                    to="/sitter-dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                      isActive('/sitter-dashboard')
                        ? 'bg-orange-50 dark:bg-orange-950/40 text-primary font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      <span>{t('navigation.sitterDashboard')}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </Link>
                ) : (
                  <Link
                    to="/become-a-sitter"
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors border border-orange-200/80 dark:border-orange-900/40 bg-orange-50/50 dark:bg-orange-950/20 text-orange-900 dark:text-orange-200'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-orange-500" />
                      <span className="font-semibold">{t('navigation.becomeSitter')}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-orange-400" />
                  </Link>
                )}
              </div>
            </div>

            {/* Section 3: Account & Management (if authenticated) */}
            {isAuthenticated && (
              <div>
                <p className="px-2 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {t('navigation.accountSettings', 'Account & Settings')}
                </p>
                <div className="space-y-1">
                  <Link
                    to="/settings/privacy"
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                      isActive('/settings/privacy')
                        ? 'bg-orange-50 dark:bg-orange-950/40 text-primary font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-slate-400" />
                      <span>{t('navigation.privacySettings')}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                        isActive('/admin')
                          ? 'bg-orange-50 dark:bg-orange-950/40 text-primary font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span>{t('navigation.admin')}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('navigation.logout')}</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      {t('navigation.login')}
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full shadow-glow">
                      {t('navigation.signup')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
