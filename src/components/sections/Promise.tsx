import { Heading } from '../ui/Heading';
import promiseImg from '../../assets/images/promise.png';
import catPng from '../../assets/images/cat.png';
import duckPng from '../../assets/images/duck.png';

export function PromiseSection() {
  return (
    <section className="px-8 md:px-16 py-24 grid md:grid-cols-2 gap-16 items-center bg-white relative overflow-hidden">
      {/* Fixed Clinical Decor - Cat */}
      <div className="absolute -left-16 bottom-0 w-80 h-80 pointer-events-none opacity-60 z-0">
        <img src={catPng} alt="Clinic Cat" className="w-full h-full object-contain object-bottom grayscale group-hover:grayscale-0 transition-all duration-1000" />
      </div>
      <div className="absolute -right-8 top-0 w-32 h-32 pointer-events-none opacity-40 z-0">
        <img src={duckPng} alt="Clinic Duck" className="w-full h-full object-contain" />
      </div>

      <div className="relative">
        <div className="aspect-square rounded-[4rem] overflow-hidden rotate-3">
          <img src={promiseImg} alt="Happy human and pet" className="w-full h-full object-cover -rotate-3" />
        </div>
        {/* Yellow Sparks Doodle - Simulated with CSS */}
        <div className="absolute -top-4 -left-4 text-veto-yellow text-4xl font-bold">///</div>
      </div>
      
      <div>
        <div className="mb-4">
          <svg height="80" viewBox="0 0 460 159" width="200" className="overflow-visible">
            <path 
              d="m0 158.998748c44.9294753-108.8160231 159.225605-158.88867702 237.913547-158.998748 78.687942-.10970482 189.412039 49.2439634 222.086453 158.998748" 
              fill="none" 
              stroke="transparent" 
              transform="matrix(1 0 0 -1 0 158.999)" 
              id="promisePath"
            ></path>
            <text className="font-bold uppercase tracking-widest text-2xl fill-veto-gray">
              <textPath href="#promisePath" startOffset="0%">
                Notre promesse pour vous...
              </textPath>
            </text>
          </svg>
        </div>
        <Heading level={2} className="mb-6 -mt-10">
          L'excellence chirurgicale, <br />
          la sérénité des propriétaires
        </Heading>
        <p className="text-veto-gray mb-8 max-w-lg leading-relaxed">
          Au sein de notre centre hospitalier, chaque protocole est rigoureusement médicalisé. 
          Nous offrons une plateforme de diagnostic avancée, centralisant les résultats de laboratoire, 
          l'imagerie médicale et le suivi post-opératoire pour une prise en charge d'exception.
        </p>
        <a href="#" className="font-bold text-veto-black underline underline-offset-4 hover:text-veto-gray transition-colors">
          En savoir plus
        </a>
      </div>
    </section>
  );
}
