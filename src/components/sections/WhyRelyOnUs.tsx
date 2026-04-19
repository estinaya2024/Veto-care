import { Heading } from '../ui/Heading';
import { PawPrint } from 'lucide-react';

export function WhyRelyOnUs() {
  const reasons = [
    {
      title: "Passion Médicale",
      description: "Nous considérons chaque animal comme un membre précieux de votre famille nécessitant des soins irréprochables avec toute l'attention médicale qu'il mérite."
    },
    {
      title: "Tranquillité d'esprit",
      description: "Des normes d'hygiène strictes pour garantir un environnement serein, où votre compagnon reçoit les meilleurs traitements sans stress prolongé."
    },
    {
      title: "Consultations Flexibles",
      description: "En plus de nos plages horaires pratiques, nous vous proposons une prise de rendez-vous rapide via notre portail en ligne pour s'adapter à votre quotidien."
    },
    {
      title: "Transparence Totale",
      description: "Nous prenons le temps de vous expliquer nos diagnostics et procédures cliniques pour vous accompagner sereinement dans les décisions de santé."
    },
    {
      title: "Prise en charge locale",
      description: "Basés à Béjaïa, nous assurons des soins personnalisés et de proximité, bâtissant une relation de confiance durable avec nos patients du quartier."
    },
    {
      title: "Urgences & Suivi",
      description: "Notre équipe est préparée pour la gestion de toute pathologie, garantissant à la fois un rétablissement optimal et un suivi digitalisé (carnet de santé)."
    }
  ];

  return (
    <section className="px-8 md:px-16 py-24 bg-white relative overflow-hidden">
      {/* Decorative Wing/Feather Doodle */}
      

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <Heading level={2} className="text-5xl md:text-7xl">
            Pourquoi nous choisir ?
          </Heading>
        </div>

        <div className="grid md:grid-cols-2 gap-x-20 gap-y-12">
          {reasons.map((reason, idx) => (
            <div key={idx} className="flex gap-6 group">
              <div className="shrink-0">
                <div className="w-14 h-14 bg-veto-blue-gray/50 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:bg-veto-yellow/20">
                  <PawPrint className="text-veto-black" size={28} />
                </div>
              </div>
              <div className="space-y-2">
                <Heading level={3} className="uppercase">
                  {reason.title}
                </Heading>
                <p className="text-veto-gray font-medium leading-relaxed max-w-md">
                  {reason.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
