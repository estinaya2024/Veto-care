import { Heading } from '../ui/Heading';
import { Heart, ShieldCheck, Clock, Users } from 'lucide-react';

export function About() {
  const features = [
    {
      icon: <ShieldCheck className="text-veto-yellow" size={32} />,
      title: "Soins Certifiés",
      description: "Notre équipe de vétérinaires hautement qualifiée assure une sécurité et une expertise inégalées."
    },
    {
      icon: <Clock className="text-veto-yellow" size={32} />,
      title: "Disponibilité 24/7",
      description: "Nous sommes là pour vos urgences, jour et nuit, pour assurer la tranquillité d'esprit."
    },
    {
      icon: <Users className="text-veto-yellow" size={32} />,
      title: "Approche Humaine",
      description: "Nous traitons chaque animal comme un membre de notre propre famille."
    }
  ];

  return (
    <section id="about" className="px-8 md:px-16 py-24 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-fadeInLeft">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-veto-yellow/10 text-veto-yellow rounded-full font-bold text-sm uppercase tracking-widest">
              <Heart size={16} className="fill-current" />
              Depuis 2005
            </div>
            <Heading level={2} className="text-4xl md:text-6xl">
              Votre clinique de confiance pour des soins d'exception.
            </Heading>
            <p className="text-xl text-veto-gray font-medium leading-relaxed">
              Chez VetoCare, nous croyons que chaque animal mérite le meilleur. Notre mission est de fournir des soins vétérinaires de pointe avec une compassion authentique.
            </p>
            <div className="grid sm:grid-cols-3 gap-8 pt-4">
              {features.map((f, i) => (
                <div key={i} className="space-y-3">
                  <div className="w-14 h-14 bg-veto-blue-gray rounded-2xl flex items-center justify-center">
                    {f.icon}
                  </div>
                  <h4 className="font-black text-sm uppercase tracking-tighter">{f.title}</h4>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative animate-fadeInRight">
            <div className="bg-veto-yellow rounded-[4rem] p-12 aspect-square flex flex-col justify-end overflow-hidden shadow-2xl">
              <div className="relative z-10 space-y-4">
                <blockquote className="text-3xl font-black text-veto-black leading-tight">
                  "Une équipe dévouée, des installations modernes et un amour immense pour nos compagnons."
                </blockquote>
                <cite className="block font-bold text-veto-black/60 not-italic">
                  — Dr. Sarah Meyer, Fondatrice
                </cite>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-3xl rounded-full -mr-20 -mt-20"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
