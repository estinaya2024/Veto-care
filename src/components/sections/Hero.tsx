import { Button } from '../ui/Button';
import { Heading } from '../ui/Heading';
import { Star, Shield, Activity, Award } from 'lucide-react';
import medIllustration1 from '../../assets/images/illustration-1.svg';
import medIllustration2 from '../../assets/images/illustration-2.svg';
import heroMainImage from '../../assets/images/iStock-1143440918 (1).webp';
import heroDog from '../../assets/images/hero_dog.png';
import bunnyPng from '../../assets/images/bunny.png';
import duckPng from '../../assets/images/duck.png';

export function Hero() {
  return (
    <section className="relative w-full min-h-screen bg-[#F0F4FD] overflow-hidden flex flex-col justify-between pt-24 md:pt-0">
      
      {/* Background Dog Image */}
      <div className="absolute right-0 bottom-0 w-[55%] lg:w-[50%] flex items-end justify-end pointer-events-none z-0 translate-x-[5%]">
        <img 
          src={heroDog} 
          alt="Noble Dog" 
          className="w-full max-w-[1000px] h-auto object-contain opacity-95 animate-fadeInRight"
          style={{ animationDelay: '200ms' }}
        />
      </div>

      {/* Floating Elements - Glass Bubbles */}
      <div className="absolute left-[8%] top-[25%] w-40 h-40 z-10 animate-float hidden xl:block">
        <div className="w-full h-full bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/50 p-6 shadow-2xl flex flex-col items-center justify-center gap-4">
           <img src={bunnyPng} alt="Bunny" className="w-16 h-16 object-contain" />
           <span className="text-[10px] font-black uppercase tracking-widest text-veto-black opacity-40">Soins Doux</span>
        </div>
      </div>

      <div className="absolute right-[25%] top-[20%] w-32 h-32 z-10 animate-float-slow hidden xl:block">
        <div className="w-full h-full bg-veto-yellow/20 backdrop-blur-xl rounded-full border border-white/50 flex items-center justify-center shadow-2xl">
           <Shield className="text-veto-black" size={40} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative z-20 max-w-[1600px] mx-auto w-full px-8 md:px-16 flex items-center">
        <div className="max-w-4xl animate-fadeInUp">
          <div className="flex items-center gap-3 mb-8">
             <span className="px-5 py-2 bg-veto-black text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                <Award size={14} className="text-veto-yellow" /> Clinique d'Élite
             </span>
             <span className="text-veto-gray font-black uppercase tracking-widest text-[10px] opacity-40">Ouvert 24h/24 • Soins Haute Précision</span>
          </div>

          <Heading className="mb-12 text-6xl lg:text-[9rem] tracking-tighter leading-[0.85] font-black text-veto-black drop-shadow-sm">
            L'Excellence <br />
            <span className="text-veto-yellow">Clinique</span>
          </Heading>
          
          <p className="max-w-xl text-xl font-bold text-veto-gray leading-relaxed mb-12 opacity-80">
            Une approche personnalisée, un seul expert qualifié. Nous transformons les soins vétérinaires en une expérience de luxe pour vos compagnons les plus précieux.
          </p>

          <div className="flex flex-wrap gap-6">
            <Button 
              variant="black" 
              className="px-14 py-6 rounded-full hover:scale-105 transition-all font-black text-xs uppercase tracking-widest shadow-2xl shadow-black/20" 
              onClick={() => window.location.href='#services'}
            >
              Découvrir nos spécialités
            </Button>
            <Button 
              variant="yellow" 
              className="px-14 py-6 rounded-full shadow-2xl shadow-veto-yellow/30 hover:scale-105 transition-all font-black text-xs uppercase tracking-widest" 
              onClick={() => window.location.href='#reservation'}
            >
              Programmer une visite
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex items-center gap-10">
             <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-veto-blue-gray flex items-center justify-center font-black text-xs">
                     {String.fromCharCode(64 + i)}
                  </div>
                ))}
                <div className="w-12 h-12 rounded-full border-4 border-white bg-veto-yellow flex items-center justify-center font-black text-xs">
                   +
                </div>
             </div>
             <div>
                <div className="flex gap-1 text-veto-yellow">
                   {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <p className="text-[10px] font-black text-veto-gray uppercase tracking-widest mt-1">Élu Meilleure Clinique 2024</p>
             </div>
          </div>
        </div>
      </div>

      {/* Foreground Overlapping Assembly */}
      <div className="relative z-30 w-full mt-auto">
        <div className="bg-white/90 backdrop-blur-3xl py-12 px-8 md:px-16 border-t border-black/5 shadow-3xl relative">
          <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-12">
            <div className="flex items-center gap-8">
               <div className="w-20 h-20 bg-veto-yellow/10 rounded-[2rem] flex items-center justify-center text-veto-yellow shadow-inner">
                  <Activity size={40} />
               </div>
               <div className="max-w-md">
                 <h3 className="font-black text-3xl text-veto-black tracking-tighter leading-none mb-2">
                   Soins Intensifs 24/7
                 </h3>
                 <p className="text-veto-gray font-black text-[10px] uppercase tracking-[0.2em] opacity-40">
                   Hôpital vétérinaire de pointe • Casablanca, Maroc
                 </p>
               </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
               {[
                 { label: 'Urgences', value: 'Instant' },
                 { label: 'Survie', value: '99%' },
                 { label: 'Experts', value: 'N°1' },
                 { label: 'Patients', value: '10k+' }
               ].map((stat, i) => (
                 <div key={i} className="flex flex-col">
                    <span className="text-[10px] font-black text-veto-gray uppercase tracking-widest opacity-40 mb-1">{stat.label}</span>
                    <span className="text-2xl font-black text-veto-black tracking-tighter">{stat.value}</span>
                 </div>
               ))}
            </div>
          </div>

          <div className="absolute -top-32 right-[10%] lg:right-[15%] w-[400px] md:w-[600px] h-0 flex items-end justify-center pointer-events-none">
            
            {/* The Cat */}
            <img 
              src={heroMainImage} 
              alt="Cat" 
              className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[450px] object-contain drop-shadow-3xl z-20 animate-fadeInUp"
            />

            <img 
              src={medIllustration1} 
              alt="Expert" 
              className="absolute -left-20 bottom-0 w-[240px] object-contain drop-shadow-xl z-20 animate-float opacity-40 grayscale"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
