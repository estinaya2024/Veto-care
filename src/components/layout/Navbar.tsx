import { ChevronDown, Heart, Phone } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

export function Navbar() {
  const navLinks = [
    { name: 'Home', hasDropdown: true },
    { name: 'Services', hasDropdown: true },
    { name: 'About', hasDropdown: true },
    { name: 'Contact', hasDropdown: true },
  ];

  return (
    <nav className="w-full py-6 px-8 md:px-16 flex items-center justify-between">
      {/* Left Links */}
      <div className="hidden lg:flex items-center gap-8">
        {navLinks.map((link) => (
          <a
            key={link.name}
            href="#"
            className="flex items-center gap-1 font-semibold text-veto-black hover:text-veto-gray transition-colors"
          >
            {link.name}
            {link.hasDropdown && <ChevronDown size={16} className="text-veto-gray" />}
          </a>
        ))}
      </div>

      {/* Center Logo */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2">
          <div className="bg-veto-black p-1 rounded-lg">
            <Heart className="text-white fill-white" size={20} />
          </div>
          <span className="font-extrabold text-2xl tracking-tighter">VetoCare</span>
        </div>
      </div>

      {/* Right Content */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 font-bold text-veto-black">
          <span className="text-veto-gray">+1-800-356-8933</span>
        </div>
        
        <div className="bg-veto-black p-2 rounded-full cursor-pointer hover:bg-opacity-80 transition-all">
          <Heart className="text-white" size={20} />
        </div>

        <Button variant="yellow" size="sm" className="hidden sm:flex font-extrabold px-6">
          Access Dashboard
        </Button>
      </div>
    </nav>
  );
}
