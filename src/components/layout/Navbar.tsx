import { Button } from '../ui/Button';
import logo from '../../assets/images/logo-icon-only.png';

export function Navbar() {
  const navLinks = [
    { name: 'Accueil', href: '/' },
    { name: 'Spécialités', href: '#services' },
    { name: 'Urgences', href: '#contact' },
    { name: 'L\'Hôpital', href: '#promise' },
  ];

  return (
    <nav className="w-full py-6 px-4 md:px-16 flex items-center justify-between bg-transparent relative z-50">
      {/* Left Logo */}
      <div className="flex flex-1 items-center justify-start">
        <a href="/" className="flex items-center group">
          <img src={logo} alt="VetoMedical Logo Mark" className="-translate-y-[15px] h-20 lg:h-24 w-auto object-contain transition-transform group-hover:scale-105" />
          <span className="-ml-2 lg:-ml-4 font-heading font-black text-3xl lg:text-4xl tracking-tighter uppercase whitespace-nowrap text-veto-black">VetoMedical</span>
        </a>
      </div>

      {/* Center Links - Hidden on Mobile */}
      <div className="hidden lg:flex flex-1 items-center justify-center gap-8">
        {navLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            className="font-bold text-veto-black hover:text-veto-gray transition-colors text-sm uppercase tracking-widest border-b-2 border-transparent hover:border-veto-yellow pb-1"
          >
            {link.name}
          </a>
        ))}
      </div>

      {/* Right Content */}
      <div className="flex flex-1 items-center justify-end gap-4 lg:gap-8">
        <div className="hidden xl:flex items-center gap-2 font-bold text-veto-black text-xs uppercase tracking-tighter opacity-70">
          <span>+1-800-VET-PRO</span>
        </div>
        
        {/* PROMINENT AUTH BUTTON */}
        <a 
          href="/login" 
          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-veto-black rounded-full font-black text-xs uppercase tracking-widest hover:bg-veto-black hover:text-white transition-all shadow-sm"
        >
          Connexion / Compte
        </a>

        <Button variant="yellow" className="hidden sm:flex font-black px-8 py-3 rounded-full text-xs uppercase tracking-widest shadow-xl ring-2 ring-white" onClick={() => window.location.href='#reservation'}>
          Prendre RDV
        </Button>
      </div>
    </nav>
  );
}
