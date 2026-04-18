import { Heading } from '../ui/Heading';
import { MapPin, Phone, Clock } from 'lucide-react';

export function Locations() {
  const locations = [
    {
      city: "Manhattan",
      address: "954 Madison Ave, New York, NY 10021",
      phone: "+1 (212) 555-0198",
      hours: "Lun - Ven: 08h - 20h / Sam: 09h - 18h",
      color: "bg-white"
    },
    {
      city: "Brooklyn",
      address: "180 Riverside Blvd, Brooklyn, NY 11201",
      phone: "+1 (718) 555-0245",
      hours: "Lun - Sam: 09h - 19h / Dim: Fermé",
      color: "bg-veto-light-blue/20"
    }
  ];

  return (
    <section id="locations" className="px-8 md:px-16 py-24 bg-veto-blue-gray/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <Heading level={2} className="text-4xl md:text-5xl">
            Proche de vous, où que vous soyez.
          </Heading>
          <p className="text-veto-gray font-medium max-w-xl mx-auto">
            Retrouvez-nous dans nos deux centres spécialisés pour des soins et un confort optimal.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {locations.map((loc, i) => (
            <div key={i} className={`p-10 rounded-[3rem] shadow-sm border border-black/5 hover:shadow-xl transition-all ${loc.color}`}>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-veto-yellow rounded-2xl flex items-center justify-center">
                  <MapPin className="text-veto-black" size={24} />
                </div>
                <h3 className="text-2xl font-black text-veto-black uppercase tracking-tighter">{loc.city}</h3>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-6 h-6 flex items-center justify-center text-veto-yellow shrink-0">
                    <MapPin size={18} />
                  </div>
                  <p className="font-bold text-veto-gray">{loc.address}</p>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-6 h-6 flex items-center justify-center text-veto-yellow shrink-0">
                    <Phone size={18} />
                  </div>
                  <p className="font-bold text-veto-gray">{loc.phone}</p>
                </div>

                <div className="flex gap-4">
                  <div className="w-6 h-6 flex items-center justify-center text-veto-yellow shrink-0">
                    <Clock size={18} />
                  </div>
                  <p className="font-bold text-veto-gray">{loc.hours}</p>
                </div>
              </div>

              <div className="mt-10">
                <button className="w-full py-4 border-2 border-veto-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-veto-black hover:text-white transition-all">
                  Voir sur la carte
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
