import { useState } from 'react';
import { Heading } from '../ui/Heading';
import { Button } from '../ui/Button';
import { MapPin, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';

const faqs = [
  {
    question: "Heures de dépôt et de récupération ?",
    answer: "Pour faciliter les jeux de groupe, nous souhaitons que tous les animaux soient déposés avant 9h. Appelez à l\\'avance pour un bain de sortie."
  },
  {
    question: "Que doit apporter mon animal ?",
    answer: "Pour qu\\'il se sente proche de vous, apportez un objet avec votre odeur (couverture, t-shirt). Cela l\\'aidera à se sentir détendu."
  },
  {
    question: "Que fait mon animal toute la journée ?",
    answer: "Un animal en santé est heureux ! Exercice quotidien, repas et repos sont au programme."
  },
  {
    question: "Quel âge doit avoir mon animal ?",
    answer: "Nous acceptons les animaux à partir de 16 semaines, après leur cycle complet de premières vaccinations."
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
            Rencontrons-nous !
          </Heading>
          
          <form className="max-w-3xl mx-auto" onSubmit={(e) => e.preventDefault()}>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-sm font-bold text-veto-black mb-2">Service souhaité</label>
                <select className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-veto-yellow outline-none transition-colors">
                  <option>Garde de jour</option>
                  <option>Promenade</option>
                  <option>Toilettage</option>
                  <option>Éducation</option>
                  <option>Consultation Vétérinaire</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-veto-black mb-2">Animal</label>
                <div className="flex gap-4">
                  <label className="flex-1 flex items-center gap-2 p-4 border-2 border-gray-100 rounded-xl cursor-pointer hover:border-veto-yellow transition-colors">
                    <input type="radio" name="pet_type" defaultChecked />
                    <span className="font-bold">Chien</span>
                  </label>
                  <label className="flex-1 flex items-center gap-2 p-4 border-2 border-gray-100 rounded-xl cursor-pointer hover:border-veto-yellow transition-colors">
                    <input type="radio" name="pet_type" />
                    <span className="font-bold">Chat</span>
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
                Commencer la réservation
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
              <h6 className="font-extrabold text-veto-black mb-2">Toilettage et soins vétérinaires :</h6>
              <p className="text-veto-gray">Manhattan, 954 Madison Ave, New York</p>
            </div>
            
            <div>
              <h6 className="font-extrabold text-veto-black mb-2">Promeneurs et gardiens :</h6>
              <p className="text-veto-gray mb-1">East Side – 864 Madison Ave, NY</p>
              <p className="text-veto-gray">West Side – 180 Riverside Blvd, NY</p>
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
