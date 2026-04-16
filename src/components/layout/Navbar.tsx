import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { useLocation } from 'react-router-dom';
import logo from '../../assets/images/logo-icon-only.png';
import { Phone, User, ShieldCheck } from 'lucide-react';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Accueil', href: '/' },
    { name: 'Spécialités', href: '#services' },
    { name: 'Urgences', href: '#contact' },
    { name: 'L\'Hôpital', href: '#promise' },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 py-4 ${
      scrolled || !isHome ? 'bg-white/80 backdrop-blur-2xl shadow-xl' : 'bg-transparent py-8'
    }`}>
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Left Logo */}
        <div className="flex items-center">
          <a href="/" className="flex items-center group relative">
            <div className="absolute -inset-4 bg-veto-yellow/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <img src={logo} alt="Logo" className="h-14 lg:h-18 w-auto object-contain transition-transform group-hover:scale-110 relative z-10" />
            <div className="ml-3 lg:ml-4 flex flex-col relative z-10">
              <span className="font-heading font-black text-2xl lg:text-3xl tracking-tighter uppercase leading-none text-veto-black">Veto-Care</span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-veto-yellow leading-none mt-1">Elite Medical</span>
            </div>
          </a>
        </div>

        {/* Center Links - Glass Pill */}
        <div className="hidden lg:flex items-center bg-black/5 backdrop-blur-md px-2 py-1.5 rounded-full border border-black/5">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest text-veto-black hover:bg-white hover:shadow-md transition-all"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 lg:gap-6">
          <div className="hidden xl:flex items-center gap-3 px-5 py-2.5 bg-veto-blue-gray/50 rounded-full border border-black/5">
            <Phone size={14} className="text-veto-black" />
            <span className="font-black text-[10px] uppercase tracking-widest text-veto-black">+1-800-VET-PRO</span>
          </div>
          
          <a 
            href="/login" 
            className="flex items-center gap-3 px-6 py-3.5 bg-white border border-black/10 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-veto-black hover:text-white transition-all shadow-sm hover:shadow-xl group"
          >
            <User size={14} className="group-hover:text-veto-yellow" />
            <span>Compte</span>
          </a>

          <Button 
            variant="yellow" 
            className="hidden sm:flex rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-veto-yellow/20 hover:scale-105"
            onClick={() => window.location.href='#reservation'}
          >
            <ShieldCheck size={16} /> RDV Urgent
          </Button>
        </div>
      </div>
    </nav>
  );
}
