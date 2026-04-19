import { ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';
import logo from '../../assets/images/logo-icon-only.png';
import { useAuth } from '../../context/AuthContext';

export function Navbar() {
  const { user } = useAuth();

  const navLinks = [
    { name: 'ACCUEIL', href: '/', hasDropdown: false },
    { name: 'À PROPOS', href: '/about', hasDropdown: false },
    { name: 'SERVICES', href: '/#services', hasDropdown: false },
    { name: 'URGENCES', href: 'tel:+1-800-VET-PRO', hasDropdown: false },
  ];

  return (
    <nav className="absolute top-0 left-0 w-full py-6 px-4 md:px-16 flex items-center justify-between bg-transparent z-50">
      {/* Left Logo */}
      <div className="flex flex-1 items-center justify-start">
        <a href="/" className="flex items-center group">
          <img src={logo} alt="VetoCare Logo" className="-translate-y-[20px] h-20 lg:h-24 w-auto object-contain transition-transform hover:scale-105" />
          <span className="-ml-2 lg:-ml-4 font-heading font-black text-3xl lg:text-4xl tracking-tighter uppercase whitespace-nowrap text-veto-black">VetoCare</span>
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
        <Button variant="outline" className="hidden sm:flex font-black px-6 py-2.5 rounded-full text-[10px] uppercase tracking-widest border-2 border-veto-black text-veto-black hover:bg-veto-black hover:text-white transition-all" onClick={() => window.location.href = user ? '/dashboard' : '/login'}>
          {user ? 'MON COMPTE' : 'CONNEXION / COMPTE'}
        </Button>
        <Button variant="yellow" className="hidden sm:flex font-black px-6 py-2.5 rounded-full text-[10px] uppercase tracking-widest shadow-lg shadow-veto-yellow/20" onClick={() => window.location.href = user ? '/dashboard' : '/login'}>
          PRENDRE RDV
        </Button>
      </div>
    </nav>
  );
}
