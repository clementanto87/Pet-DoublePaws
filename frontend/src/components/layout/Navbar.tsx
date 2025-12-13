import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { Menu, X } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { name: t('navigation.home'), path: '/' },
    ...(isAuthenticated ? [
      { name: t('navigation.dashboard'), path: '/dashboard' },
      { name: t('navigation.sitterDashboard'), path: '/sitter-dashboard' },
    ] : []),
    { name: t('navigation.becomeSitter'), path: '/become-a-sitter' },
  ];

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      isScrolled ? "glass" : "bg-transparent"
    )}>
      <nav className="mx-auto px-2 sm:px-4 md:px-6 lg:px-8 max-w-7xl overflow-x-hidden">
        <div className="flex items-center justify-between h-16 md:h-20 min-w-0">
          <div className="flex-shrink-0 flex items-center min-w-0">
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2 md:gap-3 group min-w-0">
              <Logo className="w-10 h-8 sm:w-12 sm:h-10 md:w-16 md:h-12 transition-transform group-hover:scale-110 flex-shrink-0" />
              <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-display font-bold text-gradient whitespace-nowrap">Double Paws</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              link.name === 'Bookings' ? (
                <Link key={link.path} to={link.path}>
                  <Button variant="primary" size="sm" className="shadow-glow hover:scale-105 transition-transform">
                    {link.name}
                  </Button>
                </Link>
              ) : (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary relative group",
                    isActive(link.path) ? "text-primary font-bold" : "text-muted-foreground"
                  )}
                >
                  {link.name}
                  <span className={cn(
                    "absolute -bottom-1 left-0 w-full h-0.5 bg-primary transform scale-x-0 transition-transform group-hover:scale-x-100",
                    isActive(link.path) && "scale-x-100"
                  )} />
                </Link>
              )
            ))}
            {/* Language Switcher */}
            <div className="flex items-center gap-2 mr-4">
              <button
                onClick={() => changeLanguage('en')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  i18n.language === 'en'
                    ? "bg-primary text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                )}
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage('de')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  i18n.language === 'de'
                    ? "bg-primary text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                )}
              >
                DE
              </button>
            </div>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-foreground hidden md:block">{t('navigation.hi')}, {user?.firstName}</span>
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-primary"
                  onClick={logout}
                >
                  {t('navigation.logout')}
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="secondary" className="shadow-glow">
                  {t('navigation.login')}
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            {/* Language Switcher - Mobile */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              <button
                onClick={() => changeLanguage('en')}
                className={cn(
                  "px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium transition-colors flex-shrink-0",
                  i18n.language === 'en'
                    ? "bg-primary text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                )}
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage('de')}
                className={cn(
                  "px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium transition-colors flex-shrink-0",
                  i18n.language === 'de'
                    ? "bg-primary text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                )}
              >
                DE
              </button>
            </div>
            
            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] sm:text-xs md:text-sm px-1 sm:px-1.5 md:px-2 text-muted-foreground hover:text-primary flex-shrink-0"
                onClick={logout}
              >
                <span className="hidden sm:inline">{t('navigation.logout')}</span>
                <span className="sm:hidden">Out</span>
              </Button>
            ) : (
              <Link to="/login" className="flex-shrink-0">
                <Button variant="secondary" size="sm" className="shadow-glow text-[10px] sm:text-xs md:text-sm px-1.5 sm:px-2 md:px-3">
                  <span className="hidden sm:inline">{t('navigation.login')}</span>
                  <span className="sm:hidden">In</span>
                </Button>
              </Link>
            )}
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-1.5 sm:p-2 rounded-md text-muted-foreground hover:text-primary focus:outline-none flex-shrink-0"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={cn(
        "md:hidden absolute w-full glass transition-all duration-300 ease-in-out overflow-hidden z-40",
        isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="px-3 sm:px-4 pt-2 pb-4 sm:pb-6 space-y-1 sm:space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMenuOpen(false)}
              className={cn(
                "block px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-xl transition-colors",
                isActive(link.path)
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-muted-foreground hover:bg-muted hover:text-primary"
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
