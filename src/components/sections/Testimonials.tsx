import { useState } from 'react';
import { Heading } from '../ui/Heading';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const testimonials = [
  {
    pet: "Hurley, patient du Dr. Martin",
    text: "La chirurgie de Hurley a été un succès total. L\\'équipement de monitoring et le suivi post-opératoire sont d\\'un niveau hospitalier impressionnant. Merci à toute l\\'équipe médicale !",
  },
  {
    pet: "Jame, suivi en cardiologie",
    text: "Une clinique ultra-moderne avec des spécialistes qui prennent le temps d\\'expliquer le diagnostic. Jame a retrouvé une vie normale grâce à leur expertise en médecine interne.",
  }
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => setCurrentIndex((idx) => (idx + 1) % testimonials.length);
  const prev = () => setCurrentIndex((idx) => (idx - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="px-8 md:px-16 py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
        
        {/* Left Side: Testimonial Slider */}
        <div className="flex-1 w-full relative bg-veto-light-blue p-12 rounded-[3rem]">
          <Heading level={2} className="mb-10 text-4xl">
            Ils nous recommandent :
          </Heading>
          
          <div className="relative min-h-[160px]">
            <p className="text-xl md:text-2xl font-bold italic text-veto-black mb-6">
              "{testimonials[currentIndex].text}"
            </p>
            <p className="text-lg font-extrabold text-veto-gray">
              - {testimonials[currentIndex].pet}
            </p>
          </div>

          <div className="flex gap-4 mt-8">
            <button 
              onClick={prev}
              className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:bg-veto-yellow transition-colors shadow-sm"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={next}
              className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:bg-veto-yellow transition-colors shadow-sm"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Right Side: Reviews Stats */}
        <div className="lg:w-1/3 flex flex-col gap-6">
          <div className="bg-white border-2 border-gray-100 p-8 rounded-3xl flex items-center gap-6 shadow-sm hover:border-veto-yellow transition-colors cursor-pointer">
            <div className="bg-red-500 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl">
              Y
            </div>
            <div>
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={16} className="fill-[#F87171] text-[#F87171]" />
                ))}
              </div>
              <p className="font-extrabold text-veto-black">4.9 Avis Yelp</p>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-100 p-8 rounded-3xl flex items-center gap-6 shadow-sm hover:border-veto-yellow transition-colors cursor-pointer">
            <div className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl">
              G
            </div>
            <div>
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={16} className="fill-blue-500 text-blue-500" />
                ))}
              </div>
              <p className="font-extrabold text-veto-black">4.8 Avis Google</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
