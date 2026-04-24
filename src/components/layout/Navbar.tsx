import { useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';
import logo from '../../assets/images/logo-icon-only.png';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../context/I18nContext';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const { user } = useAuth();
  const { language, setLanguage, t } = useI18n();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: t('nav.home'), href: '/', hasDropdown: false },
    { name: t('nav.about'), href: '/about', hasDropdown: false },
    { name: 'SERVICES', href: '/#services', hasDropdown: false },
  ];

  return (
    <nav className="absolute top-0 left-0 w-full py-6 px-6 md:px-16 flex items-center justify-between bg-transparent z-50">
      {/* Left Logo */}
      <div className="flex flex-1 items-center justify-start">
        <a href="/" className="flex items-center group">
          <img src={logo} alt="VetoCare Logo" className="-translate-y-[10px] lg:-translate-y-[20px] h-16 lg:h-24 w-auto object-contain transition-transform hover:scale-105" />
          <span className="-ml-1 lg:-ml-4 font-heading font-black text-2xl lg:text-4xl tracking-tighter uppercase whitespace-nowrap text-veto-black">VetoCare</span>
        </a>
      </div>

      {/* Center Links - Hidden on Mobile */}
      <div className="hidden lg:flex flex-[2] items-center justify-center gap-6">
        {navLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            className="flex items-center gap-1 font-bold text-veto-black hover:text-veto-gray transition-colors text-[10px] xl:text-xs uppercase tracking-widest"
          >
            {link.name}
            {link.hasDropdown && <ChevronDown size={14} className="text-veto-gray" />}
          </a>
        ))}
      </div>

      {/* Right Content */}
      <div className="flex flex-1 items-center justify-end gap-3 xl:gap-5">
        <button 
          onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
          className="p-2 text-[10px] font-black hover:text-veto-yellow transition-colors border border-black/10 rounded-lg bg-white/50 backdrop-blur-sm"
        >
          {language === 'fr' ? 'EN' : 'FR'}
        </button>

        <Button 
          variant="outline" 
          className="hidden md:flex font-bold px-6 py-2.5 rounded-xl text-[10px] uppercase tracking-wider border-2 border-black text-black hover:bg-black hover:text-white transition-all whitespace-nowrap" 
          onClick={() => window.location.href = user ? '/dashboard' : '/login'}
        >
          {user ? t('nav.dashboard') : t('nav.login')}
        </Button>
        <Button 
          variant="yellow" 
          className="hidden sm:flex font-bold px-6 py-2.5 rounded-xl text-[10px] uppercase tracking-wider shadow-sm whitespace-nowrap" 
          onClick={() => window.location.href = user ? '/dashboard' : '/login'}
        >
          {t('hero.cta')}
        </Button>

        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2.5 bg-gray-100 rounded-xl text-black hover:bg-veto-yellow transition-all"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-[280px] bg-white z-[101] lg:hidden shadow-xl p-8 flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <span className="font-heading font-bold text-2xl tracking-tighter uppercase text-black">VetoCare</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-bold text-black hover:text-veto-yellow transition-colors uppercase tracking-tight"
                  >
                    {link.name}
                  </a>
                ))}
              </div>

              <div className="mt-auto space-y-4">
                <Button 
                  variant="black" 
                  className="w-full font-bold py-4 rounded-xl text-[10px] uppercase tracking-widest" 
                  onClick={() => window.location.href = user ? '/dashboard' : '/login'}
                >
                  {user ? 'MON COMPTE' : 'CONNEXION'}
                </Button>
                <Button 
                  variant="yellow" 
                  className="w-full font-bold py-4 rounded-xl text-[10px] uppercase tracking-widest" 
                  onClick={() => window.location.href = user ? '/dashboard' : '/login'}
                >
                  PRENDRE RDV
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
