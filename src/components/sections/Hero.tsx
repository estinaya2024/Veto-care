import { Button } from '../ui/Button';
import { Heading } from '../ui/Heading';
import { Star } from 'lucide-react';
import medIllustration1 from '../../assets/images/illustration-medical-new.png';
import medIllustration2 from '../../assets/images/illustration-medical-2.png';
import heroMainImage from '../../assets/images/iStock-1143440918 (1).webp';
import heroDog from '../../assets/images/hero_dog.png';

export function Hero() {
  return (
    <section className="relative w-full min-h-[90vh] bg-veto-blue-gray overflow-hidden">
      
      {/* Background Dog Image - Placed on the far right */}
      <div className="absolute right-0 bottom-40 inset-y-0 w-[50%] lg:w-[40%] flex items-end justify-end pointer-events-none z-0">
        <img 
          src={heroDog} 
          alt="Large Dog holding a toy" 
          className="w-[800px] max-w-none h-auto object-contain translate-x-20 md:translate-x-32"
        />
      </div>

      {/* Main Content Area */}
      <div className="relative z-20 max-w-[1400px] mx-auto w-full px-8 md:px-16 pt-24 pb-48 grid md:grid-cols-2 gap-12 items-start h-full">
        {/* Left Typography */}
        <div className="max-w-xl animate-fadeInRight">
          <Heading className="mb-10 text-6xl lg:text-[5.5rem] tracking-tighter leading-[1.05] font-black">
            Your pet, <br />
            our priority
          </Heading>
          
          <div className="flex flex-wrap gap-4">
            <Button variant="black" className="px-10 py-5 rounded-[2rem] hover:scale-105 transition-transform font-extrabold" onClick={() => window.location.href='#services'}>
              Learn more
            </Button>
            <Button variant="yellow" className="px-10 py-5 rounded-[2rem] shadow-[0_8px_20px_rgba(255,213,0,0.3)] hover:scale-105 transition-transform font-extrabold" onClick={() => window.location.href='/dashboard'}>
              Make a reservation
            </Button>
          </div>
        </div>
      </div>

      {/* The White Bottom Bar / Footer Banner */}
      <div className="absolute bottom-0 w-full bg-white h-40 z-10 shadow-t-sm border-t border-gray-100 hidden md:block">
        <div className="max-w-[1400px] mx-auto w-full px-16 h-full flex flex-col justify-center sm:w-1/2">
          <h3 className="font-extrabold text-lg text-veto-black tracking-tight">Clinical Care & Veterinary Services</h3>
          <p className="text-veto-gray font-medium text-sm">Throughout the Region</p>
          <div className="flex items-center gap-1 mt-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <Star key={i} size={16} className="fill-[#F87171] text-[#F87171]" />
              ))}
              <Star size={16} className="fill-[#F87171]/50 text-[#F87171]" /> {/* Partial star effect */}
            </div>
            <span className="text-sm font-extrabold ml-2 text-veto-black">4.9 Patient reviews</span>
          </div>
        </div>
      </div>

      {/* Floating Foreground Assembly (Cat and Medics) */}
      <div className="absolute bottom-24 md:bottom-28 right-[5%] lg:right-[15%] flex items-end justify-center z-30 pointer-events-none w-[500px] h-[300px]">
        {/* Medic 1 (Left) */}
        <img 
          src={medIllustration1} 
          alt="Veterinarian" 
          className="absolute -left-16 md:-left-24 bottom-10 w-[160px] md:w-[220px] object-contain drop-shadow-xl animate-bounceInUp"
          style={{ animationDelay: '300ms' }}
        />

        {/* The Cat (Center) Overlapping the white border */}
        <img 
          src={heroMainImage} 
          alt="Patient Cat" 
          className="absolute left-1/2 -translate-x-1/2 -bottom-16 md:-bottom-20 w-[420px] md:w-[500px] object-contain drop-shadow-2xl z-40 animate-fadeInRight"
          style={{ animationDelay: '100ms' }}
        />

        {/* Medic 2 (Right) */}
        <img 
          src={medIllustration2} 
          alt="Veterinarian with clipboard" 
          className="absolute -right-8 md:-right-20 bottom-10 w-[150px] md:w-[200px] object-contain drop-shadow-xl animate-bounceInRight"
          style={{ animationDelay: '400ms' }}
        />
      </div>
    </section>
  );
}
