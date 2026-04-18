import { Instagram, Facebook, ArrowUp, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import logo from '../../assets/images/logo-icon-only.png';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-white pt-24 pb-12 px-6 md:px-16 border-t-[12px] border-veto-light-blue transition-colors">
      <div className="max-w-[1400px] mx-auto flex flex-col items-center">

        {/* Logo and Social Icons Row */}
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-10 mb-6">
          <div className="flex items-center group cursor-pointer" onClick={() => window.location.href = '/'}>
            <img src={logo} alt="VetoMedical Logo" className="h-14 lg:h-20 w-auto object-contain transition-transform group-hover:scale-105" />
            <span className="font-heading font-black text-3xl lg:text-4xl tracking-tighter uppercase text-veto-black -ml-2 lg:-ml-3 px-2">VETOMEDICAL</span>
          </div>

          <div className="flex gap-3">
            <a href="#" className="w-11 h-11 rounded-full bg-veto-black text-white flex items-center justify-center hover:bg-veto-yellow hover:text-veto-black transition-all hover:scale-110 shadow-lg">
              <Instagram size={20} />
            </a>
            <a href="#" className="w-11 h-11 rounded-full bg-veto-black text-white flex items-center justify-center hover:bg-veto-yellow hover:text-veto-black transition-all hover:scale-110 shadow-lg">
              <Facebook size={20} />
            </a>
          </div>
        </div>

        {/* Divider with Scroll-to-Top Button */}
        <div className="w-full relative py-12">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-black/5"></div>
          </div>
          <div className="relative flex justify-center">
            <button
              onClick={scrollToTop}
              className="bg-veto-black text-white w-14 h-14 rounded-full flex items-center justify-center hover:bg-veto-yellow hover:text-veto-black hover:scale-110 transition-all shadow-2xl z-10"
              title="Retour en haut"
            >
              <ArrowUp size={26} />
            </button>
          </div>
        </div>

        {/* Description & Navigation Menu */}
        <div className="w-full flex flex-col items-center text-center gap-12 mb-20">
          <div className="max-w-2xl">
            <p className="text-veto-gray font-bold text-xl md:text-2xl leading-snug">
              Services Professionnels de Soins pour Animaux <br />
              New York ⸺ <a href="#" className="text-veto-black underline decoration-veto-yellow decoration-4 underline-offset-4 hover:text-veto-yellow transition-colors">Paris</a> et <a href="#" className="text-veto-black underline decoration-veto-yellow decoration-4 underline-offset-4 hover:text-veto-yellow transition-colors">Lyon</a>
            </p>
          </div>

          <nav>
            <ul className="flex flex-wrap justify-center gap-x-12 gap-y-6 font-black text-sm uppercase tracking-widest text-veto-black">
              <li><a href="#" className="hover:text-veto-yellow transition-colors relative group">Services <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-veto-yellow transition-all group-hover:w-full"></span></a></li>
              <li><a href="#" className="hover:text-veto-yellow transition-colors relative group">À Propos <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-veto-yellow transition-all group-hover:w-full"></span></a></li>
              <li><a href="#" className="hover:text-veto-yellow transition-colors relative group">Localisations <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-veto-yellow transition-all group-hover:w-full"></span></a></li>
              <li><a href="#" className="hover:text-veto-yellow transition-colors relative group">Contact <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-veto-yellow transition-all group-hover:w-full"></span></a></li>
            </ul>
          </nav>
        </div>

        {/* CTA Section: "Ready to get started?" */}
        <div className="w-full text-center space-y-12 mb-24">
          <h2 className="text-4xl md:text-6xl font-black text-veto-black tracking-tighter">
            Prêt à commencer le voyage ?
          </h2>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-24 relative">
            <a href="mailto:hi@vetomedical.com" className="text-2xl font-bold text-veto-black hover:text-veto-yellow transition-colors border-b-2 border-transparent hover:border-veto-yellow pb-1">
              hi@vetomedical.com
            </a>

            <div className="relative group">
              <Button variant="yellow" className="px-16 py-6 text-xl rounded-full shadow-2xl shadow-veto-yellow/50 hover:-translate-y-2 transition-transform" onClick={() => window.location.href = '#reservation'}>
                Prendre RDV
              </Button>
              <Sparkles className="absolute -right-8 -top-8 text-veto-yellow animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" size={40} />
            </div>

            <a href="tel:+1-800-VET-PRO" className="text-2xl font-bold text-veto-black hover:text-veto-yellow transition-colors border-b-2 border-transparent hover:border-veto-yellow pb-1">
              +1-800-VET-PRO
            </a>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="w-full pt-10 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-8 text-[11px] font-bold uppercase tracking-[0.25em] text-veto-gray">
          <div>
            © 2026 &nbsp; | &nbsp; <span className="text-veto-black">VETOMEDICAL. Tous droits réservés.</span>
          </div>

          <ul className="flex flex-wrap justify-center gap-10">
            <li><a href="#" className="hover:text-veto-black transition-colors">Confidentialité</a></li>
            <li><a href="#" className="hover:text-veto-black transition-colors">Conditions</a></li>
            <li><a href="#" className="hover:text-veto-black transition-colors">Contact</a></li>
          </ul>


        </div>
      </div>
    </footer>
  );
}
