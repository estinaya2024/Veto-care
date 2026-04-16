import { useState } from 'react';
import { Heading } from '../ui/Heading';
import { Button } from '../ui/Button';
import { MapPin, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';

const faqs = [
  {
    question: "Comment se déroule une chirurgie ?",
    answer: "Chaque intervention commence par un bilan pré-anesthésique complet. Votre animal est ensuite monitoré en permanence par un technicien spécialisé jusqu\\'à son complet réveil."
  },
  {
    question: "Dois-je apporter le dossier médical ?",
    answer: "Si vous avez des analyses effectuées ailleurs, merci de les apporter. Sinon, nous créerons un dossier clinique complet lors de la première consultation."
  },
  {
    question: "Gérez-vous les urgences vitale ?",
    answer: "Notre unité de soins intensifs est prête à intervenir immédiatement pour tout cas critique, sans rendez-vous préalable."
  },
  {
    question: "Quels sont les délais pour les résultats ?",
    answer: "La plupart de nos analyses de laboratoire sont effectuées sur place avec des résultats disponibles en moins de 30 minutes."
  }
];

export function Reservation() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section id="reservation" className="px-8 md:px-16 py-24 bg-veto-light-blue/30">
      <div className="max-w-7xl mx-auto">
        
        {/* Booking Form Area */}
        <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-lg mb-20 relative overflow-hidden">
          <Heading level={2} className="mb-10 text-center">
            Demande de Consultation Clinique
          </Heading>
          
          <form className="max-w-3xl mx-auto" onSubmit={(e) => e.preventDefault()}>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-sm font-bold text-veto-black mb-2">Service souhaité</label>
                <select className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-veto-yellow outline-none transition-colors">
                  <option>Consultation Générale</option>
                  <option>Chirurgie Spécialisée</option>
                  <option>Imagerie / Radiologie</option>
                  <option>Suivi post-opératoire</option>
                  <option>Urgence Vitale</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-veto-black mb-2">Animal</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <label className="flex flex-col items-center gap-2 p-3 border-2 border-gray-100 rounded-2xl cursor-pointer hover:border-veto-yellow hover:bg-veto-yellow/5 transition-all">
                    <input type="radio" name="pet_type" value="chien" defaultChecked className="peer hidden" />
                    <span className="text-2xl">🐶</span>
                    <span className="font-bold text-xs">Chien</span>
                    <div className="w-2 h-2 rounded-full peer-checked:bg-veto-yellow"></div>
                  </label>
                  <label className="flex flex-col items-center gap-2 p-3 border-2 border-gray-100 rounded-2xl cursor-pointer hover:border-veto-yellow hover:bg-veto-yellow/5 transition-all">
                    <input type="radio" name="pet_type" value="chat" className="peer hidden" />
                    <span className="text-2xl">🐱</span>
                    <span className="font-bold text-xs">Chat</span>
                    <div className="w-2 h-2 rounded-full peer-checked:bg-veto-yellow"></div>
                  </label>
                  <label className="flex flex-col items-center gap-2 p-3 border-2 border-gray-100 rounded-2xl cursor-pointer hover:border-veto-yellow hover:bg-veto-yellow/5 transition-all">
                    <input type="radio" name="pet_type" value="lapin" className="peer hidden" />
                    <span className="text-2xl">🐰</span>
                    <span className="font-bold text-xs">Lapin</span>
                    <div className="w-2 h-2 rounded-full peer-checked:bg-veto-yellow"></div>
                  </label>
                  <label className="flex flex-col items-center gap-2 p-3 border-2 border-gray-100 rounded-2xl cursor-pointer hover:border-veto-yellow hover:bg-veto-yellow/5 transition-all">
                    <input type="radio" name="pet_type" value="vache" className="peer hidden" />
                    <span className="text-2xl">🐮</span>
                    <span className="font-bold text-xs">Vache</span>
                    <div className="w-2 h-2 rounded-full peer-checked:bg-veto-yellow"></div>
                  </label>
                  <label className="flex flex-col items-center gap-2 p-3 border-2 border-gray-100 rounded-2xl cursor-pointer hover:border-veto-yellow hover:bg-veto-yellow/5 transition-all">
                    <input type="radio" name="pet_type" value="canard" className="peer hidden" />
                    <span className="text-2xl">🦆</span>
                    <span className="font-bold text-xs">Canard</span>
                    <div className="w-2 h-2 rounded-full peer-checked:bg-veto-yellow"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-10">
              <div className="md:col-span-1">
                <label className="block text-sm font-bold text-veto-black mb-2">Date</label>
                <input type="date" className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-veto-yellow outline-none transition-colors" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-bold text-veto-black mb-2">Heure</label>
                <input type="time" className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-veto-yellow outline-none transition-colors" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-bold text-veto-black mb-2">Durée</label>
                <select className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-veto-yellow outline-none transition-colors">
                  <option>Non décidé</option>
                  <option>30 min</option>
                  <option>1 heure</option>
                  <option>Une journée</option>
                </select>
              </div>
            </div>

              <div className="text-center">
                <Button variant="black" className="px-12 py-5 rounded-full font-extrabold hover:scale-105 transition-transform">
                  Confirmer la demande de RDV
                </Button>
              </div>
          </form>
        </div>

        {/* Locations and FAQ */}
        <div className="grid md:grid-cols-2 gap-16">
          {/* Locations */}
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-veto-yellow rounded-full flex items-center justify-center">
                <MapPin size={24} className="text-veto-black" />
              </div>
              <Heading level={3} className="text-2xl">Nos Adresses</Heading>
            </div>

            <div className="mb-8">
              <h6 className="font-extrabold text-veto-black mb-2">Hôpital & Unité de Chirurgie :</h6>
              <p className="text-veto-gray">Centre Médical, 954 Madison Ave, New York</p>
            </div>
            
            <div>
              <h6 className="font-extrabold text-veto-black mb-2">Centre de Diagnostic :</h6>
              <p className="text-veto-gray mb-1">East Side – Diagnostic Imaging Hub</p>
              <p className="text-veto-gray">West Side – Central Laboratory</p>
            </div>
          </div>

          {/* FAQs */}
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-veto-yellow rounded-full flex items-center justify-center">
                <HelpCircle size={24} className="text-veto-black" />
              </div>
              <Heading level={3} className="text-2xl">Questions Fréquentes</Heading>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border-b-2 border-gray-100 pb-4">
                  <button 
                    className="w-full flex items-center justify-between py-2 text-left font-extrabold text-veto-black hover:text-veto-gray transition-colors"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  >
                    <span>{faq.question}</span>
                    {openFaq === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  <div className={cn(
                    "overflow-hidden transition-all duration-300",
                    openFaq === idx ? "max-h-40 mt-2 opacity-100" : "max-h-0 opacity-0"
                  )}>
                    <p className="text-veto-gray">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
