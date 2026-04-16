import { useState } from 'react';
import { Heading } from '../ui/Heading';
import { Button } from '../ui/Button';
import { MapPin, HelpCircle, ChevronDown, ChevronUp, Clock, ClipboardCheck, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

const faqs = [
  {
    question: "Quelle est l'expertise du Dr. Veto-Care ?",
    answer: "Notre praticien en chef est spécialisé en chirurgie complexe et diagnostic avancé. Chaque patient bénéficie d'une attention exclusive et d'un protocole de soin sur mesure."
  },
  {
    question: "Comment fonctionne le dossier numérique ?",
    answer: "Une fois inscrit, vous disposez d'un accès illimité à l'historique médical, aux résultats d'analyses et aux rappels vaccinaux de vos compagnons via notre extranet sécurisé."
  },
  {
    question: "Gérez-vous les urgences critiques ?",
    answer: "Absolument. Notre bloc opératoire et notre unité de soins intensifs sont opérationnels 24/7 pour les interventions vitales immédiates."
  },
  {
    question: "Puis-je enregistrer plusieurs animaux ?",
    answer: "Oui, notre système 'Elite' permet une gestion illimitée de patients pour un même propriétaire, avec des dossiers médicaux individuels complets."
  }
];

export function Reservation() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section id="reservation" className="px-8 md:px-16 py-32 bg-[#F8FAFC]">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Booking Form Area */}
        <div className="bg-white rounded-[4rem] p-12 md:p-24 shadow-3xl mb-32 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-veto-yellow/5 rounded-full blur-[120px] -mr-48 -mt-48 transition-colors group-hover:bg-veto-yellow/10"></div>
          
          <div className="max-w-4xl mx-auto relative z-10">
             <div className="text-center mb-16">
                <span className="px-5 py-2 bg-veto-blue-gray/50 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-veto-black mb-6 inline-block">
                   <Sparkles size={14} className="inline mr-2 text-veto-yellow" /> Conciergerie Médicale
                </span>
                <Heading level={2} className="text-5xl lg:text-6xl tracking-tighter mb-4">
                  Demande d'Admission <span className="text-veto-yellow">Clinique</span>
                </Heading>
                <p className="font-bold text-veto-gray opacity-60 text-lg">Initialisez le dossier médical pour une prise en charge prioritaire.</p>
             </div>
            
            <form className="space-y-12" onSubmit={(e) => e.preventDefault()}>
              <div className="grid lg:grid-cols-2 gap-12">
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-veto-gray uppercase tracking-widest ml-6">Service de Pointe</label>
                   <div className="relative">
                      <select className="w-full px-10 py-6 bg-veto-blue-gray/30 rounded-full border-none focus:ring-4 focus:ring-veto-yellow/20 outline-none transition-all font-black text-sm appearance-none cursor-pointer">
                        <option>Consultation Spécialisée</option>
                        <option>Chirurgie & Orthopédie</option>
                        <option>Imagerie High-Tech</option>
                        <option>Bilan Préventif Complet</option>
                        <option>Admission Urgente</option>
                      </select>
                      <ChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 text-veto-gray pointer-events-none" size={20} />
                   </div>
                </div>
                
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-veto-gray uppercase tracking-widest ml-6">Espèce du Patient</label>
                   <div className="grid grid-cols-5 gap-3">
                     {['🐶', '🐱', '🐰', '🐮', '🦆'].map((emoji, i) => (
                       <label key={i} className="flex flex-col items-center gap-3 p-5 bg-veto-blue-gray/10 border-2 border-transparent rounded-[2rem] cursor-pointer hover:bg-white hover:border-veto-yellow hover:shadow-xl transition-all group/opt">
                         <input type="radio" name="pet_type" className="hidden" defaultChecked={i === 0} />
                         <span className="text-3xl group-hover/opt:scale-110 transition-transform">{emoji}</span>
                         <div className="w-2 h-2 rounded-full border-2 border-veto-gray/20 group-hover/opt:border-veto-yellow"></div>
                       </label>
                     ))}
                   </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-8 p-10 bg-veto-blue-gray/10 rounded-[3rem] border border-black/5">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-veto-gray uppercase tracking-widest">Date Souhaitée</label>
                  <input type="date" className="w-full px-8 py-5 bg-white rounded-full border-none focus:ring-4 focus:ring-veto-yellow/20 outline-none font-black text-sm shadow-sm" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-veto-gray uppercase tracking-widest">Fenêtre Horaire</label>
                  <input type="time" className="w-full px-8 py-5 bg-white rounded-full border-none focus:ring-4 focus:ring-veto-yellow/20 outline-none font-black text-sm shadow-sm" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-veto-gray uppercase tracking-widest">Niveau d'Urgence</label>
                  <select className="w-full px-8 py-5 bg-white rounded-full border-none focus:ring-4 focus:ring-veto-yellow/20 outline-none font-black text-sm shadow-sm appearance-none">
                    <option>Standard</option>
                    <option>Prioritaire</option>
                    <option>Critique</option>
                  </select>
                </div>
              </div>

              <div className="text-center pt-8">
                <Button variant="black" className="px-16 py-7 rounded-full text-sm font-black uppercase tracking-[0.2em] shadow-3xl shadow-black/20 hover:scale-105 transition-all">
                  <ClipboardCheck size={20} className="text-veto-yellow" /> Valider mon admission
                </Button>
                <p className="mt-6 text-[10px] font-black text-veto-gray uppercase tracking-widest opacity-40">Réponse garantie sous 15 minutes par notre équipe.</p>
              </div>
            </form>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid lg:grid-cols-12 gap-20">
          {/* Coordinates */}
          <div className="lg:col-span-5 space-y-12 animate-fadeInUp">
            <div className="space-y-4">
               <div className="w-20 h-20 bg-veto-yellow rounded-[2rem] flex items-center justify-center shadow-xl mb-10">
                 <MapPin size={32} className="text-veto-black" />
               </div>
               <Heading level={3} className="text-4xl tracking-tighter">Clinique <span className="text-veto-yellow">Centrale</span></Heading>
               <p className="text-veto-gray font-bold text-lg opacity-60">Située au cœur du quartier médical, notre clinique offre un environnement calme et technologique.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-10 pt-10 border-t border-black/5">
              <div className="space-y-4">
                <h6 className="font-black text-xs uppercase tracking-widest text-veto-black flex items-center gap-2">
                   <Clock size={14} className="text-veto-yellow" /> Urgences 24/7
                </h6>
                <p className="text-sm font-bold text-veto-gray leading-relaxed">
                   Boulevard de la Corniche,<br />
                   Casablanca, Maroc
                </p>
              </div>
              <div className="space-y-4">
                <h6 className="font-black text-xs uppercase tracking-widest text-veto-black flex items-center gap-2">
                   <HelpCircle size={14} className="text-veto-yellow" /> Contact Direct
                </h6>
                <p className="text-sm font-bold text-veto-gray leading-relaxed">
                   +212 522 00 00 00<br />
                   contact@veto-care.ma
                </p>
              </div>
            </div>
          </div>

          {/* FAQs - Elite Glassmorphism */}
          <div className="lg:col-span-7">
            <div className="space-y-6">
              {faqs.map((faq, idx) => (
                <div key={idx} className={`rounded-[2.5rem] border border-black/5 transition-all duration-500 ${
                  openFaq === idx ? "bg-white shadow-2xl p-10" : "bg-white/40 hover:bg-white/60 p-8"
                }`}>
                  <button 
                    className="w-full flex items-center justify-between text-left group"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  >
                    <span className="font-black text-xl text-veto-black tracking-tighter group-hover:text-veto-yellow transition-colors">{faq.question}</span>
                    <div className={`p-2 rounded-full transition-all ${openFaq === idx ? "bg-veto-black text-white" : "bg-black/5"}`}>
                       {openFaq === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </button>
                  <div className={cn(
                    "overflow-hidden transition-all duration-700",
                    openFaq === idx ? "max-h-96 mt-6 opacity-100" : "max-h-0 opacity-0"
                  )}>
                    <p className="text-veto-gray font-bold text-lg leading-relaxed opacity-70 border-l-4 border-veto-yellow pl-8">{faq.answer}</p>
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
