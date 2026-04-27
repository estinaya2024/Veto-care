import { Heading } from '../ui/Heading';

import medIllustration1 from '../../assets/images/med-illu-1.svg';
import medIllustration2 from '../../assets/images/med-illu-2.svg';
import heroMainImage from '../../assets/images/hero-cat.webp';
import heroDog from '../../assets/images/hero_dog.png';

import { useI18n } from '../../context/I18nContext';

export function Hero() {
  const { t } = useI18n();
  return (
    <section className="relative w-full min-h-[85vh] md:min-h-screen bg-[#E3EAF7] overflow-hidden flex flex-col justify-between">

      {/* Background Dog Image */}
      <div className="absolute right-0 bottom-0 md:bottom-[10%] w-[80%] md:w-[60%] lg:w-[45%] flex items-end justify-end pointer-events-none z-0 translate-x-[15%] md:translate-x-[5%] lg:translate-x-[10%] opacity-40 md:opacity-90">
        <img
          src={heroDog}
          alt="Large Dog"
          className="w-full max-w-[900px] h-auto object-contain animate-fadeInRight"
          style={{ animationDelay: '400ms' }}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative z-20 max-w-[1400px] mx-auto w-full px-6 md:px-16 pt-[116px] md:pt-[180px] pb-48 md:pb-80 lg:pb-64 flex flex-col">
        {/* Left Typography */}
        <div className="max-w-4xl animate-fadeInRight text-center md:text-left">
          <Heading className="mb-6 md:mb-12 text-[40px] sm:text-[60px] md:text-[80px] lg:text-[6.5rem] tracking-tighter leading-[0.9] font-black text-veto-black drop-shadow-sm whitespace-pre-line">
            {t('hero.title')}
          </Heading>


        </div>
      </div>

      {/* Foreground Content Assembly: Cat and Groomers overlapping the bottom banner */}
      <div className="relative z-30 w-full">
        {/* Bottom Banner Area */}
        <div className="bg-white py-12 px-8 md:px-16 border-t border-gray-100 shadow-2xl relative">
          <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-md text-center md:text-left">
              <h3 className="font-black text-xl md:text-2xl text-veto-black tracking-tight leading-tight mb-1">
                {t('hero.services_banner_title')}
              </h3>
              <p className="text-veto-gray font-bold text-base md:text-lg">
                {t('hero.services_banner_location')}
              </p>
            </div>
          </div>
        </div>

        {/* Overlapping Assembly Positioning Container - Responsive sizes */}
        <div className="absolute top-0 right-[2%] md:right-[5%] lg:right-[15%] w-[300px] sm:w-[400px] md:w-[600px] h-0 flex items-end justify-center pointer-events-none">

          {/* Groomer Left (smaller) */}
          <img
            src={medIllustration1}
            alt="Groomer 1"
            className="absolute -left-8 md:-left-12 bottom-0 w-[120px] sm:w-[160px] md:w-[220px] object-contain drop-shadow-sm z-10 animate-bounceInUp transform translate-y-[20%]"
            style={{ animationDelay: '300ms' }}
          />

          {/* The Cat (Center piece) */}
          <img
            src={heroMainImage}
            alt="Cat"
            className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[200px] sm:w-[260px] md:w-[400px] object-contain drop-shadow-xl z-20 animate-fadeInRight transform translate-y-[15%]"
            style={{ animationDelay: '100ms' }}
          />

          {/* Groomer Right (larger/walking) */}
          <img
            src={medIllustration2}
            alt="Groomer 2"
            className="absolute -right-4 md:-right-8 bottom-0 w-[130px] sm:w-[180px] md:w-[250px] object-contain drop-shadow-sm z-30 animate-bounceInRight transform translate-y-[45%]"
            style={{ animationDelay: '500ms' }}
          />
        </div>
      </div>
    </section>
  );
}
