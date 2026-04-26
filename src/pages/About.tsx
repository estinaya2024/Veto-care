import { Heading } from '../components/ui/Heading';
import { Stethoscope, ShieldCheck, Clock, Award } from 'lucide-react';
import aboutImg from '../assets/images/about-clinic.png';
import { useI18n } from '../context/I18nContext';

export function About() {
  const { t } = useI18n();

  const features = [
    t('about.feature1'),
    t('about.feature2'),
    t('about.feature3'),
    t('about.feature4'),
  ];

  const cards = [
    { icon: Stethoscope, titleKey: 'about.card1_title', descKey: 'about.card1_desc' },
    { icon: Clock,       titleKey: 'about.card2_title', descKey: 'about.card2_desc' },
    { icon: Award,       titleKey: 'about.card3_title', descKey: 'about.card3_desc' },
  ];

  return (
    <div className="pt-40 pb-24 px-6 md:px-16 max-w-[1400px] mx-auto min-h-screen">
       <div className="text-center mb-20 animate-fadeInUp">
         <Heading level={1} className="text-5xl md:text-7xl font-black tracking-tighter text-veto-black mb-6">
           {t('about.title')} <span className="text-veto-yellow">VetoCare</span>
         </Heading>
         <p className="text-veto-gray text-xl md:text-2xl font-bold max-w-3xl mx-auto leading-relaxed">
           {t('about.subtitle')}
         </p>
       </div>

       <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
         <div className="space-y-8 animate-fadeInLeft">
           <Heading level={2} className="text-4xl lg:text-5xl font-black tracking-tight text-veto-black leading-tight">
             {t('about.passion_title')}
           </Heading>
           <p className="text-lg text-veto-gray leading-relaxed font-bold">
             {t('about.passion_body')}
           </p>
           <ul className="space-y-4 pt-4">
             {features.map((item, i) => (
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
                <div className="h-[400px] lg:h-[500px] bg-veto-blue-gray rounded-[2rem] flex items-center justify-center overflow-hidden relative group">
                   <img src={aboutImg} alt="Vétérinaire experte en consultation" className="w-full h-full object-cover relative z-10 group-hover:scale-110 transition-transform duration-700 origin-center" />
                   <div className="absolute inset-0 bg-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none"></div>
                </div>
            </div>
         </div>
       </div>

       <div className="grid md:grid-cols-3 gap-8 pt-10 border-t-[12px] border-veto-blue-gray">
          {cards.map((feature, idx) => (
             <div key={idx} className="bg-white p-10 rounded-[3rem] shadow-lg border border-black/5 hover:-translate-y-4 transition-transform duration-500 group">
                <div className="bg-veto-blue-gray w-20 h-20 rounded-3xl flex items-center justify-center mb-8 text-veto-black group-hover:bg-veto-yellow transition-colors shadow-inner">
                   <feature.icon size={36} />
                </div>
                <h3 className="text-2xl font-black text-veto-black mb-4 tracking-tighter">{t(feature.titleKey)}</h3>
                <p className="text-veto-gray font-bold leading-relaxed">{t(feature.descKey)}</p>
             </div>
          ))}
       </div>
    </div>
  );
}
