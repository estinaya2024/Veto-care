import { ChevronDown, Heart } from 'lucide-react';
import { Button } from '../ui/Button';
import logo from '../../assets/images/logo-icon-only.png';

export function Navbar() {
  const navLinks = [
    { name: 'Home', hasDropdown: true },
    { name: 'Services', hasDropdown: true },
    { name: 'About', hasDropdown: true },
    { name: 'Contact', hasDropdown: true },
  ];

  return (
    <nav className="w-full py-6 px-4 md:px-16 flex items-center justify-between bg-transparent">
      {/* Left Logo */}
      <div className="flex flex-1 items-center justify-start">
        <a href="/" className="flex items-center group">
          <img src={logo} alt="VetoCare Logo" className="-translate-y-[20px] h-20 lg:h-24 w-auto object-contain transition-transform hover:scale-105" />
          <span className="-ml-2 lg:-ml-4 font-heading font-black text-3xl lg:text-4xl tracking-tighter uppercase whitespace-nowrap text-veto-black">VetoCare</span>
        </a>
      </div>

      {/* Center Links - Hidden on Mobile */}
      <div className="hidden lg:flex flex-1 items-center justify-center gap-6">
        {navLinks.map((link) => (
          <a
            key={link.name}
            href="#"
            className="flex items-center gap-1 font-bold text-veto-black hover:text-veto-gray transition-colors text-sm uppercase tracking-wide"
          >
            {link.name}
            {link.hasDropdown && <ChevronDown size={14} className="text-veto-gray" />}
          </a>
        ))}
      </div>

      {/* Right Content */}
      <div className="flex flex-1 items-center justify-end gap-6">
        <div className="hidden xl:flex items-center gap-2 font-bold text-veto-black text-sm">
          <span>+1-800-356-8933</span>
        </div>
        
        <div className="bg-veto-black w-10 h-10 rounded-full cursor-pointer hover:bg-opacity-80 transition-all flex items-center justify-center">
          <Heart className="text-white fill-white" size={18} />
        </div>

        <Button variant="yellow" className="hidden sm:flex font-black px-8 py-2.5 rounded-full text-xs uppercase tracking-widest shadow-lg">
          Book now
        </Button>
      </div>
    </nav>
  );
}
