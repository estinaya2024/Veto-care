import { Cat, Dog, Rabbit, Bird, HeartPulse, Stethoscope, Fish, Turtle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PetAvatarProps {
  species: string;
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function PetAvatar({ species, name, className, size = 'md' }: PetAvatarProps) {
  const s = species.toLowerCase();
  
  let Icon = HeartPulse;
  let bgClass = 'bg-veto-blue-gray/50 text-veto-black';
  let iconClass = 'text-veto-black';

  if (s.includes('chat') || s.includes('félin')) {
    Icon = Cat;
    bgClass = 'bg-orange-100 border-orange-200 text-orange-600';
    iconClass = 'text-orange-500';
  } else if (s.includes('chien') || s.includes('canin')) {
    Icon = Dog;
    bgClass = 'bg-blue-100 border-blue-200 text-blue-600';
    iconClass = 'text-blue-500';
  } else if (s.includes('lapin')) {
    Icon = Rabbit;
    bgClass = 'bg-pink-100 border-pink-200 text-pink-600';
    iconClass = 'text-pink-500';
  } else if (s.includes('oiseau') || s.includes('perroquet') || s.includes('poule')) {
    Icon = Bird;
    bgClass = 'bg-sky-100 border-sky-200 text-sky-600';
    iconClass = 'text-sky-500';
    iconClass = 'text-sky-500';
  } else if (s.includes('poisson')) {
    Icon = Fish;
    bgClass = 'bg-blue-50 border-blue-100 text-blue-400';
    iconClass = 'text-blue-400';
  } else if (s.includes('reptile') || s.includes('tortue') || s.includes('serpent')) {
    Icon = Turtle;
    bgClass = 'bg-green-100 border-green-200 text-green-600';
    iconClass = 'text-green-500';
  } else {
    Icon = Stethoscope;
    bgClass = 'bg-veto-yellow/20 border-veto-yellow/30 text-veto-black';
    iconClass = 'text-veto-black';
  }

  const dimensions = {
    sm: 'w-8 h-8 rounded-md',
    md: 'w-12 h-12 rounded-xl',
    lg: 'w-16 h-16 rounded-2xl',
    xl: 'w-32 h-32 rounded-3xl'
  };

  const iconSizes = {
    sm: 14,
    md: 20,
    lg: 28,
    xl: 48
  };

  return (
    <div className={cn('flex items-center justify-center border relative shadow-sm', bgClass, dimensions[size], className)} title={`${name} (${species})`}>
      <Icon size={iconSizes[size]} className={cn('opacity-80', iconClass)} />
      {/* Small letter overlay at bottom right for uniqueness */}
      {size !== 'sm' && (
        <span className="absolute -bottom-1 -right-1 bg-white shadow-sm border border-black/5 w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-black text-veto-black uppercase">
          {name[0]}
        </span>
      )}
    </div>
  );
}
