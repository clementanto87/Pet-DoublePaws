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
      <nav className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <Logo className="w-16 h-12 transition-transform group-hover:scale-110" />
              <span className="text-2xl font-display font-bold text-gradient">Double Paws</span>
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
          <div className="md:hidden flex items-center gap-2">
            {/* Language Switcher - Mobile */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => changeLanguage('en')}
                className={cn(
                  "px-2 py-1 rounded text-xs font-medium transition-colors",
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
                  "px-2 py-1 rounded text-xs font-medium transition-colors",
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
                className="mr-2 text-muted-foreground hover:text-primary"
                onClick={logout}
              >
                {t('navigation.logout')}
              </Button>
            ) : (
              <Link to="/login" className="mr-2">
                <Button variant="secondary" size="sm" className="shadow-glow">
                  {t('navigation.login')}
                </Button>
              </Link>
            )}
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-primary focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={cn(
        "md:hidden absolute w-full glass transition-all duration-300 ease-in-out overflow-hidden",
        isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMenuOpen(false)}
              className={cn(
                "block px-4 py-3 text-base font-medium rounded-xl transition-colors",
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
