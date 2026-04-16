import { Facebook, Twitter, Instagram, ArrowRight } from 'lucide-react';
import logo from '../../assets/images/logo-icon-only.png';

export function Footer() {
  return (
    <footer className="w-full bg-veto-black text-white pt-24 pb-12 px-8 md:px-16 overflow-hidden relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-16 mb-20">
          
          {/* Logo and About */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center gap-3 mb-6 group cursor-pointer">
              <img src={logo} alt="VetoCare Logo Mark" className="h-16 w-auto brightness-0 invert group-hover:scale-110 transition-transform" />
              <span className="font-extrabold text-3xl tracking-tighter">VetoMedical</span>
            </div>
            <p className="text-gray-400 text-lg leading-relaxed">
              Centre hospitalier vétérinaire d'excellence spécialisé en chirurgie, imagerie de pointe et soins intensifs 24h/24.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-veto-yellow hover:text-black hover:border-veto-yellow transition-all">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-veto-yellow hover:text-black hover:border-veto-yellow transition-all">
                <Twitter size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-veto-yellow hover:text-black hover:border-veto-yellow transition-all">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Site Links */}
          <div>
            <h6 className="font-extrabold text-xl mb-8">Navigation</h6>
            <ul className="space-y-4 text-lg">
              <li><a href="/" className="text-gray-400 hover:text-veto-yellow transition-colors flex items-center gap-2 group"><ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" /> Accueil</a></li>
              <li><a href="#services" className="text-gray-400 hover:text-veto-yellow transition-colors flex items-center gap-2 group"><ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" /> Services</a></li>
              <li><a href="/dashboard" className="text-gray-400 hover:text-veto-yellow transition-colors flex items-center gap-2 group"><ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" /> Mon Compte</a></li>
              <li><a href="#" className="text-gray-400 hover:text-veto-yellow transition-colors flex items-center gap-2 group"><ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" /> À propos</a></li>
            </ul>
          </div>

          {/* Quick Contact */}
          <div>
            <h6 className="font-extrabold text-xl mb-8">Nous Contacter</h6>
            <ul className="space-y-6 text-lg text-gray-400">
              <li className="flex flex-col gap-1">
                <span className="text-white font-bold text-sm uppercase tracking-widest opacity-50">Téléphone</span>
                <span>+1-800-356-8933</span>
              </li>
              <li className="flex flex-col gap-1">
                <span className="text-white font-bold text-sm uppercase tracking-widest opacity-50">Email</span>
                <span>hello@vetocare.com</span>
              </li>
              <li className="flex flex-col gap-1">
                <span className="text-white font-bold text-sm uppercase tracking-widest opacity-50">Localisation</span>
                <span>954 Madison Ave, New York, NY 10021</span>
              </li>
            </ul>
          </div>

          
        </div>

        <div className="border-t border-gray-800 pt-12 flex flex-col md:flex-row items-center justify-between gap-6 text-gray-500 font-bold">
          <p>© 2026 VetoCare. Tous droits réservés.</p>
          
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-veto-yellow/5 rounded-full blur-[100px]" />
    </footer>
  );
}
