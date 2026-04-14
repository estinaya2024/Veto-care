import { Heading } from '../ui/Heading';
import { Heart, Clock, UserCheck, ShieldCheck, Search, Users } from 'lucide-react';

const reasons = [
  {
    title: 'Nous aimons les animaux',
    description: "Nous comprenons que votre compagnon est un membre précieux de votre famille et mérite la meilleure attention.",
    icon: Heart,
  },
  {
    title: 'Sérénité',
    description: "Vous voulez vous assurer qu'ils reçoivent les meilleurs soins en votre absence. Laissez-nous faire.",
    icon: ShieldCheck,
  },
  {
    title: 'Pratique',
    description: "En plus de nos horaires flexibles, nous offrons la réservation en ligne pour une planification simplifiée.",
    icon: Clock,
  },
  {
    title: 'Transparence',
    description: "Nous voulons que vous ayez une confiance totale dans les soins que nous prodiguons à votre compagnon.",
    icon: Search,
  },
  {
    title: 'Soins personnalisés',
    description: "Notre équipe de professionnels qualifiés s'engage à fournir des soins sur mesure pour chaque animal.",
    icon: UserCheck,
  },
  {
    title: 'Travail d\'équipe',
    description: "Vétérinaires, techniciens et spécialistes travaillent ensemble pour garantir des soins optimaux.",
    icon: Users,
  },
];

export function WhyChooseUs() {
  return (
    <section className="px-8 md:px-16 py-24 bg-veto-light-blue">
      <div className="max-w-7xl mx-auto">
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
