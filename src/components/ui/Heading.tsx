import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4;
}

const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 1, ...props }, ref) => {
    const Component = `h${level}` as const;
    
    const sizes = {
      1: 'text-5xl md:text-7xl leading-[1.1]',
      2: 'text-4xl md:text-5xl leading-tight',
      3: 'text-2xl md:text-3xl',
      4: 'text-xl',
    };

    return (
      <Component
        ref={ref}
        className={cn(
          'font-heading font-extrabold text-veto-black tracking-tight',
          sizes[level],
          className
        )}
        {...props}
      />
    );
  }
);

Heading.displayName = 'Heading';

export { Heading };
