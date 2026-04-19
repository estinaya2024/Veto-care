import { Button } from '../ui/Button';
import { Heading } from '../ui/Heading';

import medIllustration1 from '../../assets/images/med-illu-1.svg';
import medIllustration2 from '../../assets/images/med-illu-2.svg';
import heroMainImage from '../../assets/images/hero-cat.webp';
import heroDog from '../../assets/images/hero_dog.png';

export function Hero() {
  return (
    <section className="relative w-full min-h-screen bg-[#E3EAF7] overflow-hidden flex flex-col justify-between">

      {/* Background Dog Image - Placed on the far right, slightly behind */}
      <div className="absolute right-0 bottom-[10%] w-[50%] lg:w-[45%] flex items-end justify-end pointer-events-none z-0 translate-x-[5%] lg:translate-x-[10%]">
        <img
          src={heroDog}
          alt="Large Dog"
          className="w-full max-w-[900px] h-auto object-contain opacity-90 animate-fadeInRight"
          style={{ animationDelay: '400ms' }}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative z-20 max-w-[1400px] mx-auto w-full px-8 md:px-16 pt-[160px] pb-64 lg:pb-32 flex flex-col">
        {/* Left Typography */}
        <div className="max-w-2xl animate-fadeInRight">
          <Heading className="mb-12 text-[40px] lg:text-[7.5rem] tracking-tighter leading-[0.95] font-black text-veto-black drop-shadow-sm">
            Your pet, <br />
            our priority
          </Heading>

          <div className="flex flex-wrap gap-5">
            <Button variant="black" className="px-12 py-5 rounded-full hover:scale-105 transition-transform font-black text-sm uppercase tracking-widest shadow-xl" onClick={() => window.location.href = '#services'}>
              Learn more
            </Button>
            <Button variant="yellow" className="px-12 py-5 rounded-full shadow-[0_10px_30px_rgba(255,213,0,0.4)] hover:scale-105 transition-transform font-black text-sm uppercase tracking-widest" onClick={() => window.location.href = '#reservation'}>
              Make a reservation
            </Button>
          </div>
        </div>
      </div>

      {/* Foreground Content Assembly: Cat and Groomers overlapping the bottom banner */}
      <div className="relative z-30 w-full">
        {/* Bottom Banner Area */}
        <div className="bg-white py-12 px-8 md:px-16 border-t border-gray-100 shadow-2xl relative">
          <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-md">
              <h3 className="font-black text-2xl text-veto-black tracking-tight leading-tight mb-1">
                Dog Walking & Pet Sitting Services
              </h3>
              <p className="text-veto-gray font-bold text-lg">
                À travers <span className="underline decoration-veto-yellow decoration-2 cursor-pointer">Béjaïa, Algérie</span>
              </p>
            </div>



          </div>
        </div>

        {/* Overlapping Assembly Positioning Container */}
        <div className="absolute top-0 right-[5%] lg:right-[15%] w-[400px] md:w-[600px] h-0 flex items-end justify-center pointer-events-none">

          {/* Groomer Left (smaller) */}
          <img
            src={medIllustration1}
            alt="Groomer 1"
            className="absolute -left-12 bottom-0 w-[160px] md:w-[220px] object-contain drop-shadow-sm z-10 animate-bounceInUp transform translate-y-[20%]"
            style={{ animationDelay: '300ms' }}
          />

          {/* The Cat (Center piece overlapping the white bar) */}
          <img
            src={heroMainImage}
            alt="Cat"
            className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[260px] md:w-[400px] object-contain drop-shadow-xl z-20 animate-fadeInRight transform translate-y-[15%]"
            style={{ animationDelay: '100ms' }}
          />

          {/* Groomer Right (larger/walking) */}
          <img
            src={medIllustration2}
            alt="Groomer 2"
            className="absolute -right-8 bottom-0 w-[180px] md:w-[250px] object-contain drop-shadow-sm z-30 animate-bounceInRight transform translate-y-[45%]"
            style={{ animationDelay: '500ms' }}
          />
        </div>
      </div>
    </section>
  );
}
