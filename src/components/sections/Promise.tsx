import { Heading } from '../ui/Heading';
import promiseImg from '../../assets/images/promise.png';

export function PromiseSection() {
  return (
    <section className="px-8 md:px-16 py-24 grid md:grid-cols-2 gap-16 items-center bg-white">
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
          Des animaux sains, <br />
          des humains sereins
        </Heading>
        <p className="text-veto-gray mb-8 max-w-lg leading-relaxed">
          Parce que la santé de votre compagnon ne doit pas être une source de stress, 
          nous avons conçu un espace fluide pour centraliser tout son suivi médical. 
          Gérez ses vaccinations, ses soins et ses rendez-vous en quelques clics.
        </p>
        <a href="#" className="font-bold text-veto-black underline underline-offset-4 hover:text-veto-gray transition-colors">
          En savoir plus
        </a>
      </div>
    </section>
  );
}
