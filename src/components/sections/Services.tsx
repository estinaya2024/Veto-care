import { Heading } from '../ui/Heading';
import { Syringe, FileText, Stethoscope, ClipboardList, Calendar, PawPrint } from 'lucide-react';
import { cn } from '../../lib/utils';
import heroPaw from '../../assets/images/paw.png';

const services = [
  { name: 'Vaccinations', icon: Syringe },
  { name: 'Dossier Médical', icon: FileText },
  { name: 'Visites Vétos', icon: Stethoscope },
  { name: 'Ordonnances', icon: ClipboardList },
  { name: 'Rendez-vous', icon: Calendar },
  { name: 'Profil Animal', icon: PawPrint },
];

export function Services() {
  return (
    <section id="services" className="px-6 md:px-16 py-16 md:py-24 bg-white text-center relative overflow-hidden">
      {/* Paw reaching from the left - Hidden or reduced on small mobile */}
      <img
        src={heroPaw}
        alt="Cat Paw"
        className="absolute left-0 top-16 md:top-32 w-[120px] md:w-[220px] object-contain z-10 drop-shadow-xl -translate-x-[20%] md:-translate-x-[20%] -rotate-12 animate-fadeInLeft opacity-30 md:opacity-100"
      />
      <div className="relative inline-block mb-12 md:mb-16">
        <Heading level={2} className="text-4xl md:text-5xl lg:text-6xl">Nous excellons en :</Heading>
        {/* Yellow Doodle */}
        <div className="absolute -top-4 -right-4 md:-right-8 text-veto-yellow text-2xl md:text-4xl rotate-12">///</div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8 max-w-6xl mx-auto relative z-20">
        {services.map((service, index) => (
          <div key={index} className="flex flex-col items-center gap-4 group cursor-pointer">
            <div className={cn(
              "w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-veto-light-blue rounded-2xl md:rounded-3xl flex items-center justify-center transition-all duration-300",
              "group-hover:bg-veto-yellow group-hover:-translate-y-2 group-hover:shadow-lg"
            )}>
              <service.icon size={32} className="text-veto-black transition-transform duration-300 group-hover:scale-110 md:hidden" strokeWidth={1.5} />
              <service.icon size={40} className="text-veto-black transition-transform duration-300 group-hover:scale-110 hidden md:block" strokeWidth={1.5} />
            </div>
            <span className="font-bold text-veto-black tracking-tight text-sm md:text-base">{service.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
