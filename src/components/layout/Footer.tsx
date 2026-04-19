import { Instagram, Facebook, ArrowUp, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import logo from '../../assets/images/logo-icon-only.png';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-white text-veto-black px-8 md:px-16 pt-24 pb-12 border-t border-gray-100 transition-colors relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-veto-blue-gray/30 rounded-full blur-[120px] -mr-64 -mb-64 pointer-events-none"></div>
      
      <div className="max-w-[1400px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 relative z-10">
        {/* Left: Brand & Statement */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="flex items-center group cursor-pointer" onClick={() => window.location.href = '/'}>
            <div className="w-12 h-12 bg-veto-yellow rounded-2xl flex items-center justify-center p-2 shadow-lg shadow-veto-yellow/20">
              <img src={logo} alt="VetoCare Logo" className="w-full h-auto object-contain" />
            </div>
            <span className="font-heading font-black text-3xl tracking-tighter uppercase ml-3">VETOCARE</span>
          </div>
          <p className="text-veto-gray font-bold text-base leading-relaxed max-w-sm">
            L'excellence clinique au service de vos compagnons. <br />
            Réservez, discutez et suivez la santé de vos animaux en quelques clics.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-12 h-12 rounded-2xl bg-veto-blue-gray text-veto-black flex items-center justify-center hover:bg-veto-yellow transition-all hover:-translate-y-1 shadow-sm">
              <Instagram size={20} />
            </a>
            <a href="#" className="w-12 h-12 rounded-2xl bg-veto-blue-gray text-veto-black flex items-center justify-center hover:bg-veto-yellow transition-all hover:-translate-y-1 shadow-sm">
              <Facebook size={20} />
            </a>
          </div>
        </div>

        {/* Middle: Navigation Links */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <h4 className="font-black text-xs tracking-widest uppercase text-veto-black border-l-4 border-veto-yellow pl-4">Menu</h4>
          <ul className="flex flex-col gap-4 font-bold text-sm text-veto-gray">
            <li><a href="/" className="hover:text-veto-yellow transition-colors">Accueil</a></li>
            <li><a href="/about" className="hover:text-veto-yellow transition-colors">Notre Clinique</a></li>
            <li><a href="#services" className="hover:text-veto-yellow transition-colors">Services</a></li>
            <li><a href="#testimonials" className="hover:text-veto-yellow transition-colors">Avis Clients</a></li>
          </ul>
        </div>

        {/* Middle: Quick Help */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <h4 className="font-black text-xs tracking-widest uppercase text-veto-black border-l-4 border-veto-yellow pl-4">Support</h4>
          <ul className="flex flex-col gap-4 font-bold text-sm text-veto-gray">
            <li><a href="#contact" className="hover:text-veto-yellow transition-colors">Contact</a></li>
            <li><a href="/login" className="hover:text-veto-yellow transition-colors">Espace Client</a></li>
            <li><a href="#faq" className="hover:text-veto-yellow transition-colors">FAQ</a></li>
            <li><a href="tel:+21334000000" className="hover:text-veto-yellow transition-colors text-veto-black">Urgences 24/7</a></li>
          </ul>
        </div>

        {/* Right: Newsletter/CTA */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <h4 className="font-black text-xs tracking-widest uppercase text-veto-black border-l-4 border-veto-yellow pl-4">Newsletter</h4>
          <p className="text-veto-gray font-bold text-sm">Recevez nos conseils santé et actualités.</p>
          <div className="flex bg-veto-blue-gray p-2 rounded-2xl border border-black/5 focus-within:border-veto-yellow transition-all">
            <input 
              type="email" 
              placeholder="votre@email.com" 
              className="bg-transparent border-none outline-none flex-1 px-4 font-bold text-sm"
            />
            <Button variant="black" className="rounded-xl px-6 py-3 text-[10px] uppercase font-black tracking-widest">OK</Button>
          </div>
        </div>
      </div>

      {/* Bottom: Legal */}
      <div className="max-w-[1400px] w-full mx-auto mt-24 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-bold uppercase tracking-[0.3em] text-veto-gray relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-veto-black">© 2026 VetoCare Béjaïa</span>
          <span className="hidden md:inline">|</span>
          <span>Tous droits réservés.</span>
        </div>
        <ul className="flex flex-wrap justify-center gap-10">
          <li><a href="#" className="hover:text-veto-black lg:hover:tracking-[0.4em] transition-all">Confidentialité</a></li>
          <li><a href="#" className="hover:text-veto-black lg:hover:tracking-[0.4em] transition-all">Conditions</a></li>
        </ul>
        <button
          onClick={scrollToTop}
          className="w-12 h-12 bg-veto-black text-white rounded-full flex items-center justify-center hover:bg-veto-yellow hover:text-veto-black transition-all hover:-translate-y-2 shadow-xl shadow-black/10 group"
          title="Retour en haut"
        >
          <ArrowUp size={20} className="group-hover:animate-bounce" />
        </button>
      </div>
    </footer>
  );
}
    </footer>
  );
}
