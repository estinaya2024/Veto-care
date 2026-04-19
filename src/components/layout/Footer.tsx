import { Instagram, Facebook, ArrowUp, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import logo from '../../assets/images/logo-icon-only.png';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#E3EAF7] text-veto-black min-h-[400px] lg:h-[400px] px-8 md:px-16 pt-16 pb-8 border-t-[12px] border-veto-yellow transition-colors flex flex-col justify-between relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/50 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none"></div>
      
      <div className="max-w-[1400px] mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10 flex-1 content-center">
        {/* Left: Brand & Info */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="flex items-center group cursor-pointer" onClick={() => window.location.href = '/'}>
            <img src={logo} alt="VetoMedical Logo" className="h-14 w-auto object-contain transition-transform group-hover:scale-105" />
            <span className="font-heading font-black text-3xl tracking-tighter uppercase ml-2 text-veto-black">VETOMEDICAL</span>
          </div>
          <p className="text-veto-gray font-bold text-sm leading-snug max-w-sm">
            Services Professionnels de Soins pour Animaux <br />
            Béjaïa, Algérie
          </p>
          <div className="flex gap-3">
            <a href="#" className="w-10 h-10 rounded-full bg-white text-veto-black flex items-center justify-center hover:bg-veto-yellow transition-all hover:scale-110 shadow-sm border border-black/5">
              <Instagram size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white text-veto-black flex items-center justify-center hover:bg-veto-yellow transition-all hover:scale-110 shadow-sm border border-black/5">
              <Facebook size={18} />
            </a>
          </div>
        </div>

        {/* Middle: Navigation */}
        <div className="md:col-span-3 flex flex-col gap-6 mt-4 md:mt-0">
          <h4 className="font-black text-lg tracking-widest uppercase text-veto-black">Menu</h4>
          <ul className="flex flex-col gap-3 font-bold text-sm text-veto-gray">
            <li><a href="/#services" className="hover:text-veto-black transition-colors">Services</a></li>
            <li><a href="/about" className="hover:text-veto-black transition-colors">À Propos</a></li>
            <li><a href="#contact" className="hover:text-veto-black transition-colors">Contact</a></li>
          </ul>
        </div>

        {/* Right: CTA & Contacts */}
        <div className="md:col-span-5 flex flex-col gap-4 items-start md:items-end text-left md:text-right mt-4 md:mt-0">
          <h2 className="text-3xl font-black tracking-tighter text-veto-black">
            Prêt à commencer ?
          </h2>
          <div className="flex flex-col gap-1 text-veto-gray font-bold mb-2">
            <a href="mailto:hi@vetomedical.com" className="hover:text-veto-black transition-colors">hi@vetomedical.com</a>
            <a href="tel:+1-800-VET-PRO" className="hover:text-veto-black transition-colors">+1-800-VET-PRO</a>
          </div>
          <div className="relative group">
            <Button variant="yellow" className="px-8 py-3 text-sm rounded-full shadow-lg shadow-veto-yellow/20 hover:-translate-y-1 transition-transform" onClick={() => window.location.href = '/dashboard'}>
              Prendre RDV
            </Button>
            <Sparkles className="absolute -right-4 -top-4 text-veto-yellow animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
          </div>
        </div>
      </div>

      {/* Bottom: Copyright & Top Button */}
      <div className="max-w-[1400px] w-full mx-auto pt-6 border-t border-black/10 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-veto-gray relative z-10 mt-8">
        <div>
          © 2026 &nbsp;|&nbsp; <span className="text-veto-black">VETOMEDICAL. Tous droits réservés.</span>
        </div>
        <ul className="flex flex-wrap justify-center gap-8">
          <li><a href="#" className="hover:text-veto-black transition-colors">Confidentialité</a></li>
          <li><a href="#" className="hover:text-veto-black transition-colors">Conditions</a></li>
        </ul>
        <button
          onClick={scrollToTop}
          className="bg-white text-veto-black w-10 h-10 rounded-full flex items-center justify-center hover:bg-veto-yellow hover:scale-110 transition-all shadow-sm border border-black/5"
          title="Retour en haut"
        >
          <ArrowUp size={18} />
        </button>
      </div>
    </footer>
  );
}
