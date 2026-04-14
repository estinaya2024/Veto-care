import { Instagram } from 'lucide-react';
import { Heading } from '../ui/Heading';

const gallery = [
  "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=400&h=400",
  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400&h=400",
  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400&h=400",
  "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=400&h=400",
  "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=400&h=400",
  "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?auto=format&fit=crop&q=80&w=400&h=400",
];

export function Social() {
  return (
    <section className="px-8 md:px-16 py-24 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-6 group cursor-pointer transition-transform hover:scale-105">
            <div className="w-16 h-16 bg-veto-black rounded-full flex items-center justify-center text-white transition-colors group-hover:bg-veto-yellow group-hover:text-veto-black">
              <Instagram size={32} />
            </div>
            <div>
              <Heading level={3} className="text-3xl lg:text-4xl text-veto-black">
                Suivez PetMania
              </Heading>
              <p className="text-veto-gray font-bold">@petmania.vamtam</p>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="text-veto-yellow text-5xl font-bold animate-pulse">
              ★★★
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {gallery.map((img, idx) => (
            <div 
              key={idx} 
              className="aspect-square rounded-[2rem] overflow-hidden group cursor-pointer relative"
            >
              <img 
                src={img} 
                alt="Pet gallery" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-veto-yellow/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Instagram size={32} className="text-white drop-shadow-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
