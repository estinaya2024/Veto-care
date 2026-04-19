import { useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';
import logo from '../../assets/images/logo-icon-only.png';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'ACCUEIL', href: '/', hasDropdown: false },
    { name: 'À PROPOS', href: '/about', hasDropdown: false },
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
      <div className="flex flex-1 items-center justify-end gap-3 xl:gap-6">
        <Button 
          variant="outline" 
          className="hidden md:flex font-black px-6 py-2.5 rounded-full text-[10px] uppercase tracking-widest border-2 border-veto-black text-veto-black hover:bg-veto-black hover:text-white transition-all whitespace-nowrap" 
          onClick={() => window.location.href = user ? '/dashboard' : '/login'}
        >
          {user ? 'MON COMPTE' : 'CONNEXION / COMPTE'}
        </Button>
        <Button 
          variant="yellow" 
          className="hidden sm:flex font-black px-6 py-2.5 rounded-full text-[10px] uppercase tracking-widest shadow-lg shadow-veto-yellow/20 whitespace-nowrap" 
          onClick={() => window.location.href = user ? '/dashboard' : '/login'}
        >
          PRENDRE RDV
        </Button>

        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm text-veto-black hover:bg-veto-yellow transition-all"
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
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-[280px] bg-white z-[101] lg:hidden shadow-2xl p-8 flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <span className="font-heading font-black text-2xl tracking-tighter uppercase text-veto-black">VetoCare</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-black text-veto-black hover:text-veto-yellow transition-colors uppercase tracking-tight"
                  >
                    {link.name}
                  </a>
                ))}
              </div>

              <div className="mt-auto space-y-4">
                <Button 
                  variant="black" 
                  className="w-full font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest" 
                  onClick={() => window.location.href = user ? '/dashboard' : '/login'}
                >
                  {user ? 'MON COMPTE' : 'CONNEXION'}
                </Button>
                <Button 
                  variant="yellow" 
                  className="w-full font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-veto-yellow/20" 
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
