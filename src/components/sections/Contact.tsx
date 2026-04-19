import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { Heading } from '../ui/Heading';
import { Button } from '../ui/Button';

export function Contact() {
  const businessHours = [
    { days: 'Lundi - Vendredi', hours: '08:00 - 19:00' },
    { days: 'Samedi', hours: '09:00 - 17:00' },
    { days: 'Dimanche', hours: 'Urgences uniquement' },
  ];

  return (
    <section id="contact" className="py-24 bg-veto-blue-gray relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 md:px-16">
        <div className="grid lg:grid-cols-2 gap-16">
          
          {/* Left Side: Contact Info & Hours */}
          <div className="animate-fadeInLeft">
            <div className="inline-block px-4 py-1.5 bg-veto-black/5 rounded-full text-veto-black font-black uppercase tracking-widest text-[10px] mb-4">
              Nous Contacter
            </div>
            <Heading level={2} className="text-5xl md:text-7xl mb-8">
              Où nous trouver ?
            </Heading>
            
            <div className="space-y-12">
              {/* Contact Details */}
              <div className="grid sm:grid-cols-2 gap-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0">
                    <MapPin className="text-veto-yellow" size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-lg mb-1">Localisation</h4>
                    <p className="text-veto-gray font-bold text-sm">Cité 1000 Logements, <br />Béjaïa, Algérie</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0">
                    <Phone className="text-veto-yellow" size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-lg mb-1">Téléphone</h4>
                    <p className="text-veto-gray font-bold text-sm">+213 34 00 00 00 <br />+213 555 00 00 00</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0">
                    <Mail className="text-veto-yellow" size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-lg mb-1">E-mail</h4>
                    <p className="text-veto-gray font-bold text-sm">clinique@vetocare.dz <br />contact@vetocare.dz</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0">
                    <Clock className="text-veto-yellow" size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-lg mb-1">Disponibilité</h4>
                    <p className="text-veto-gray font-bold text-sm">24h/24 pour <br />les urgences</p>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="p-8 bg-white rounded-[3rem] shadow-xl shadow-black/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-veto-yellow/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                <h4 className="font-black text-xl mb-6 relative z-10 flex items-center gap-3">
                    <Clock className="text-veto-yellow" /> Horaires d'ouverture
                </h4>
                <div className="space-y-4 relative z-10">
                  {businessHours.map((item, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                      <span className="font-extrabold text-veto-black">{item.days}</span>
                      <span className="font-bold text-veto-gray px-4 py-1 bg-veto-blue-gray rounded-full text-xs">{item.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Map & Quick Inquiry */}
          <div className="space-y-8 animate-fadeInRight" style={{ animationDelay: '200ms' }}>
            {/* Map Placeholder */}
            <div className="w-full h-[400px] bg-white rounded-[3.5rem] p-4 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-4 bg-gray-100 rounded-[2.5rem] flex items-center justify-center overflow-hidden border border-gray-200">
                    {/* Visual Placeholder for Google Map */}
                    <div className="absolute inset-0 opacity-40 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/5.1012,36.7511,12,0/800x600?access_token=pk.placeholder')] bg-cover bg-center"></div>
                    <div className="relative z-10 flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-veto-yellow rounded-full flex items-center justify-center animate-bounce shadow-xl shadow-veto-yellow/30">
                            <MapPin className="text-veto-black" size={32} />
                        </div>
                        <span className="font-black text-veto-black uppercase tracking-widest text-[10px] bg-white px-4 py-2 rounded-full shadow-lg">Retrouvez-nous à Béjaïa</span>
                    </div>
                </div>
            </div>

            {/* CTA Inquiry */}
            <div className="bg-veto-black p-10 rounded-[4rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 group">
                <div className="space-y-2">
                    <h3 className="text-2xl font-black tracking-tight">Besoin d'aide ?</h3>
                    <p className="text-veto-gray font-bold text-sm max-w-xs">Nos vétérinaires sont à votre entière disposition pour toute question.</p>
                </div>
                <Button variant="yellow" className="w-full md:w-auto px-10 py-5 rounded-full shadow-xl shadow-veto-yellow/20 hover:scale-105 transition-all text-sm font-black uppercase tracking-widest flex items-center gap-3">
                    <Send size={18} /> Envoyez un message
                </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
