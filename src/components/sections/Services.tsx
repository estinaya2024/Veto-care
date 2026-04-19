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
    <section id="services" className="px-8 md:px-16 py-24 bg-white text-center relative overflow-hidden">
      {/* Paw reaching from the left */}
      <img
        src={heroPaw}
        alt="Cat Paw"
        className="absolute left-0 top-0 w-[160px] md:w-[220px] object-contain z-10 drop-shadow-xl -translate-x-[15%] md:-translate-x-[20%] -translate-y-[20%] md:-translate-y-[30%] -rotate-12 animate-fadeInLeft"
      />
      <div className="relative inline-block mb-16">
        <Heading level={2}>Nous excellons en :</Heading>
        {/* Yellow Doodle */}
        <div className="absolute -top-4 -right-8 text-veto-yellow text-4xl rotate-12">///</div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-8 max-w-6xl mx-auto">
        {services.map((service, index) => (
          <div key={index} className="flex flex-col items-center gap-4 group cursor-pointer">
            <div className={cn(
              "w-24 h-24 md:w-32 md:h-32 bg-veto-light-blue rounded-3xl flex items-center justify-center transition-all duration-300",
              "group-hover:bg-veto-yellow group-hover:-translate-y-2 group-hover:shadow-lg"
            )}>
              <service.icon size={40} className="text-veto-black transition-transform duration-300 group-hover:scale-110" strokeWidth={1.5} />
            </div>
            <span className="font-bold text-veto-black tracking-tight">{service.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
