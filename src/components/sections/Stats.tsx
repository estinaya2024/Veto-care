import { Users, Heart, Award, Clock } from 'lucide-react';
import { Heading } from '../ui/Heading';

const stats = [
  { label: 'Animaux Soignés', value: '5K+', icon: Heart, color: 'text-veto-yellow' },
  { label: 'Clients Satisfaits', value: '1,2K+', icon: Users, color: 'text-blue-500' },
  { label: 'Années d\'Expérience', value: '15+', icon: Award, color: 'text-green-500' },
  { label: 'Urgence 24/7', value: '100%', icon: Clock, color: 'text-red-500' },
];

export function Stats() {
  return (
    <section className="py-20 bg-veto-black text-white relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-white rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-veto-yellow rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-8 md:px-16 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          {stats.map((stat, idx) => (
            <div key={idx} className="space-y-4 animate-fadeInUp" style={{ animationDelay: `${idx * 150}ms` }}>
              <div className="flex justify-center">
                <div className="p-4 bg-white/5 rounded-3xl backdrop-blur-sm border border-white/10 group hover:border-veto-yellow transition-colors duration-500">
                  <stat.icon className={`${stat.color} group-hover:scale-110 transition-transform duration-500`} size={32} />
                </div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-black mb-1">{stat.value}</div>
                <div className="text-veto-gray font-bold uppercase tracking-widest text-[10px]">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
