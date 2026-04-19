import { Heading } from '../components/ui/Heading';
import { Heart, Stethoscope, ShieldCheck, Clock, Award } from 'lucide-react';

export function About() {
  return (
    <div className="pt-40 pb-24 px-6 md:px-16 max-w-[1400px] mx-auto min-h-screen">
       <div className="text-center mb-20 animate-fadeInUp">
         <Heading level={1} className="text-5xl md:text-7xl font-black tracking-tighter text-veto-black mb-6">
           À Propos de <span className="text-veto-yellow">VetoCare</span>
         </Heading>
         <p className="text-veto-gray text-xl md:text-2xl font-bold max-w-3xl mx-auto leading-relaxed">
           Notre clinique vétérinaire située à <span className="text-veto-black">Béjaïa</span> est dédiée à la santé, au bien-être et au bonheur de vos compagnons à quatre pattes.
         </p>
       </div>

       <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
         <div className="space-y-8 animate-fadeInLeft">
           <Heading level={2} className="text-4xl lg:text-5xl font-black tracking-tight text-veto-black leading-tight">
             Une passion pour <br/> la médecine vétérinaire
           </Heading>
           <p className="text-lg text-veto-gray leading-relaxed font-bold">
             Fondée avec l'objectif d'offrir des soins d'excellence, la clinique combine une technologie vétérinaire de pointe avec une philosophie profondément humaine. Nous pensons que chaque animal mérite une attention personnalisée dans un environnement chaleureux, apaisant et sécurisant.
           </p>
           <ul className="space-y-4 pt-4">
             {[
               "Équipement de diagnostic moderne",
               "Bloc chirurgical stérile de dernière génération",
               "Chambres d'hospitalisation confortables",
               "Suivi digitalisé complet de chaque patient"
             ].map((item, i) => (
               <li key={i} className="flex items-center gap-4 text-veto-black font-black uppercase tracking-widest text-[11px]">
                 <div className="bg-veto-yellow/20 p-3 rounded-full">
                   <ShieldCheck className="text-veto-yellow" size={20} />
                 </div>
                 {item}
               </li>
             ))}
           </ul>
         </div>

         <div className="relative animate-fadeInRight mt-10 md:mt-0">
            <div className="absolute inset-0 bg-veto-yellow/10 rounded-[3rem] transform rotate-6 border-2 border-veto-yellow/30 transition-transform hover:rotate-2 duration-500"></div>
            <div className="bg-white p-4 rounded-[3rem] shadow-2xl relative z-10 border border-black/5">
                <div className="h-[400px] lg:h-[500px] bg-veto-blue-gray rounded-[2rem] flex items-center justify-center flex-col gap-6 overflow-hidden relative group">
                   <Heart size={80} className="text-white fill-white relative z-10 group-hover:scale-110 transition-transform duration-500" />
                   <p className="text-white font-black text-2xl tracking-tighter relative z-10">La vie avant tout</p>
                   <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
            </div>
         </div>
       </div>

       <div className="grid md:grid-cols-3 gap-8 pt-10 border-t-[12px] border-veto-blue-gray">
          {[
            { icon: Stethoscope, title: "Expertise Clinique", desc: "Des années d'expérience consolidée en médecine interne, dermatologie et chirurgie spécifique." },
            { icon: Clock, title: "Disponibilité", desc: "Des rendez-vous adaptés à votre emploi du temps et des canaux dédiés pour les suivis post-opératoires." },
            { icon: Award, title: "Qualité Certifiée", desc: "Des standards stricts d'hygiène et de sécurité protocolaire appliqués pour chaque intervention." }
          ].map((feature, idx) => (
             <div key={idx} className="bg-white p-10 rounded-[3rem] shadow-lg border border-black/5 hover:-translate-y-4 transition-transform duration-500 group">
                <div className="bg-veto-blue-gray w-20 h-20 rounded-3xl flex items-center justify-center mb-8 text-veto-black group-hover:bg-veto-yellow transition-colors shadow-inner">
                   <feature.icon size={36} />
                </div>
                <h3 className="text-2xl font-black text-veto-black mb-4 tracking-tighter">{feature.title}</h3>
                <p className="text-veto-gray font-bold leading-relaxed">{feature.desc}</p>
             </div>
          ))}
       </div>
    </div>
  );
}
