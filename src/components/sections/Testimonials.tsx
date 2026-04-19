import { Star, Quote } from 'lucide-react';
import { Heading } from '../ui/Heading';

const reviews = [
  {
    name: "Karim Benali",
    pet: "Rex (Berger Allemand)",
    text: "Une équipe extraordinaire. Ils ont sauvé mon chien après un accident grave. Le suivi sur le portail en ligne est vraiment pratique !",
    rating: 5
  },
  {
    name: "Sarah Mansouri",
    pet: "Mimi (Siamois)",
    text: "La meilleure clinique de Béjaïa. Dr. Karou est très à l'écoute et prend le temps d'expliquer chaque soin. Je recommande à 100%.",
    rating: 5
  },
  {
    name: "Amine Rezgui",
    pet: "Snow (Loulou)",
    text: "Service irréprochable et hygiène parfaite. Le système de rendez-vous en ligne est un vrai gain de temps pour mon emploi du temps chargé.",
    rating: 5
  }
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-white relative overflow-hidden">
      {/* Background Decorative Paw */}
      <div className="absolute -bottom-20 -left-20 text-veto-blue-gray/20 opacity-30 rotate-12 pointer-events-none">
        <svg width="400" height="400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-5 4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-12.5 8c-1.4 0-2.5 1.1-2.5 2.5s1.1 2.5 2.5 2.5 2.5-1.1 2.5-2.5-1.1-2.5-2.5-2.5zm15 0c-1.4 0-2.5 1.1-2.5 2.5s1.1 2.5 2.5 2.5 2.5-1.1 2.5-2.5-1.1-2.5-2.5-2.5zm-7.5 1c-2.5 0-4.5 2-4.5 4.5s2 4.5 4.5 4.5 4.5-2 4.5-4.5-2-4.5-4.5-4.5z"/>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-8 md:px-16 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 bg-veto-yellow/10 rounded-full text-veto-yellow font-black uppercase tracking-widest text-[10px] mb-4">
            Témoignages
          </div>
          <Heading level={2} className="text-5xl md:text-7xl mb-6">
            Ce que disent nos clients
          </Heading>
          <p className="text-veto-gray font-bold max-w-2xl mx-auto">
            La santé de vos compagnons est notre plus belle récompense. Découvrez les retours de notre communauté à Béjaïa.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((review, idx) => (
            <div 
              key={idx} 
              className="group p-8 bg-veto-blue-gray/30 rounded-[3rem] border border-transparent hover:border-veto-yellow/30 hover:bg-white hover:shadow-2xl hover:shadow-veto-yellow/5 transition-all duration-500 animate-fadeInUp"
              style={{ animationDelay: `${idx * 200}ms` }}
            >
              <div className="flex gap-1 mb-6">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} size={16} className="fill-veto-yellow text-veto-yellow" />
                ))}
              </div>
              
              <div className="relative mb-8">
                <Quote className="absolute -top-4 -left-4 text-veto-yellow opacity-10" size={48} />
                <p className="italic text-veto-black font-extrabold leading-relaxed relative z-10">
                  "{review.text}"
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-veto-yellow rounded-full flex items-center justify-center font-black text-veto-black text-lg">
                  {review.name[0]}
                </div>
                <div>
                  <h4 className="font-black text-veto-black tracking-tight leading-none">{review.name}</h4>
                  <span className="text-[10px] font-bold text-veto-gray uppercase tracking-widest">{review.pet}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
