import { Heading } from '../ui/Heading';
import { ShieldCheck, Search, Clock, Users, Activity } from 'lucide-react';

const reasons = [
  {
    title: 'Expertise Chirurgicale',
    description: "Nos chirurgiens sont spécialisés dans les interventions complexes et les soins d'urgence vitale.",
    icon: ShieldCheck,
  },
  {
    title: 'Imagerie de Pointe',
    description: "Équipements de radiologie de dernière génération pour un diagnostic clinique immédiat et précis.",
    icon: Search,
  },
  {
    title: 'Urgences 24h/24',
    description: "Une équipe médicale de garde prête à prendre en charge les patients critiques sans interruption.",
    icon: Clock,
  },
  {
    title: 'Laboratoire Médical',
    description: "Analyses de sang et examens de laboratoire effectués sur place pour une réactivité hospitalière.",
    icon: Activity,
  },
  {
    title: 'Hospitalisation Sécurisée',
    description: "Unités de soins surveillées en permanence pour une convalescence optimale sous monitoring.",
    icon: ShieldCheck,
  },
  {
    title: 'Parcours Thérapeutique',
    description: "Suivi médical rigoureux et plans de traitement personnalisés pour chaque patient cliniquement suivi.",
    icon: Users,
  },
];

import cowPng from '../../assets/images/cow.png';

export function WhyChooseUs() {
  return (
    <section className="px-8 md:px-16 py-24 bg-veto-light-blue relative overflow-hidden">
      {/* Static Cow Decor */}
      <div className="absolute -right-24 bottom-0 w-96 h-96 z-0 opacity-20 pointer-events-none">
        <img src={cowPng} alt="Cow Background" className="w-full h-full object-contain object-bottom grayscale" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <Heading level={2} className="text-center mb-16">
          Pourquoi nous faire confiance ?
        </Heading>

        <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <div key={index} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-veto-yellow flex items-center justify-center shadow-lg">
                  <Icon size={28} className="text-veto-black" strokeWidth={2} />
                </div>
                <div>
                  <h5 className="font-extrabold text-xl mb-3 text-veto-black">{reason.title}</h5>
                  <p className="text-veto-gray leading-relaxed">
                    {reason.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
