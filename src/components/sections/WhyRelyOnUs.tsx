import { Heading } from '../ui/Heading';
import { PawPrint } from 'lucide-react';

export function WhyRelyOnUs() {
  const reasons = [
    {
      title: "We love dogs",
      description: "We understand that your furry friend is a treasured member of your family and deserves the best care and attention possible."
    },
    {
      title: "Peace of mind",
      description: "We know that leaving your furry friend can be stressful, and you want to ensure that they are receiving the best care while you're away."
    },
    {
      title: "Convenience",
      description: "In addition to our convenient appointment times, we also offer online booking for easy scheduling."
    },
    {
      title: "Transparency", // Corrected typo from image
      description: "We want you to feel confident in the care we provide and trust that we have your dog's best interests at heart."
    },
    {
      title: "Personalized care",
      description: "Our team of trained professionals is dedicated to providing personalized care for every dog that comes through our doors."
    },
    {
      title: "Teamwork",
      description: "Our team of vets, technicians, and other pet care professionals work together to ensure that your dog receives the best possible care."
    }
  ];

  return (
    <section className="px-8 md:px-16 py-24 bg-white relative overflow-hidden">
      {/* Decorative Wing/Feather Doodle */}
      

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <Heading level={2} className="text-5xl md:text-7xl">
            Why rely on us?
          </Heading>
        </div>

        <div className="grid md:grid-cols-2 gap-x-20 gap-y-12">
          {reasons.map((reason, idx) => (
            <div key={idx} className="flex gap-6 group">
              <div className="shrink-0">
                <div className="w-14 h-14 bg-veto-blue-gray/50 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:bg-veto-yellow/20">
                  <PawPrint className="text-veto-black" size={28} />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-veto-black tracking-tight uppercase">
                  {reason.title}
                </h3>
                <p className="text-veto-gray font-medium leading-relaxed max-w-md">
                  {reason.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
