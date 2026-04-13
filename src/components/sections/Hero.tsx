import { Button } from '../ui/Button';
import { Heading } from '../ui/Heading';
import heroDog from '../../assets/images/hero_dog.png';
import groomingImg from '../../assets/images/grooming.png';
import { Star } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative px-8 md:px-16 pt-12 pb-24 grid md:grid-cols-2 gap-12 items-center overflow-hidden">
      {/* Left Content */}
      <div className="z-10 max-w-xl">
        <Heading className="mb-8">
          Votre animal, <br />
          notre priorité
        </Heading>
        
        <div className="flex flex-wrap gap-4 mb-12">
          <Button variant="black">En savoir plus</Button>
          <Button variant="yellow">Dashboard</Button>
        </div>

        <div className="space-y-1">
          <p className="font-bold text-veto-black">
            Suivi médical & vaccinations
          </p>
          <p className="text-veto-gray font-medium">
            Partout en France et à domicile
          </p>
          <div className="flex items-center gap-1 mt-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={14} className="fill-[#F87171] text-[#F87171]" />
              ))}
            </div>
            <span className="text-xs font-bold ml-1 text-veto-black">4.9 Veto-Care avis</span>
          </div>
        </div>
      </div>

      {/* Right Content - Images */}
      <div className="relative">
        {/* Large Dog Image */}
        <div className="relative z-0">
          <img 
            src={heroDog} 
            alt="Hero Dog" 
            className="w-full h-auto object-contain scale-110 -rotate-3"
          />
        </div>

        {/* Grooming Illustration - Absolute Positioned */}
        <div className="absolute top-1/2 -left-12 transform -translate-y-1/2 z-20 w-1/2">
          <img 
            src={groomingImg} 
            alt="Grooming Illustration" 
            className="w-full h-auto rounded-3xl"
          />
        </div>
      </div>
    </section>
  );
}
