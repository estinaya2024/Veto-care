import { Heading } from '../ui/Heading';
import { PawPrint } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

export function WhyRelyOnUs() {
  const { t } = useI18n();

  const reasons = [
    { titleKey: 'why.reason1.title', descKey: 'why.reason1.desc' },
    { titleKey: 'why.reason2.title', descKey: 'why.reason2.desc' },
    { titleKey: 'why.reason3.title', descKey: 'why.reason3.desc' },
    { titleKey: 'why.reason4.title', descKey: 'why.reason4.desc' },
    { titleKey: 'why.reason5.title', descKey: 'why.reason5.desc' },
    { titleKey: 'why.reason6.title', descKey: 'why.reason6.desc' },
  ];

  return (
    <section className="px-8 md:px-16 py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <Heading level={2} className="text-5xl md:text-7xl">
            {t('why.heading')}
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
                <Heading level={3} className="uppercase">
                  {t(reason.titleKey)}
                </Heading>
                <p className="text-veto-gray font-medium leading-relaxed max-w-md">
                  {t(reason.descKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
