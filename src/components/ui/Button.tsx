import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'yellow' | 'black' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'yellow', size = 'md', ...props }, ref) => {
    const variants = {
      yellow: 'btn-yellow focus:ring-4 focus:ring-veto-yellow/30',
      black: 'btn-black focus:ring-4 focus:ring-veto-black/30',
      ghost: 'btn-ghost hover:bg-black/5',
      outline: 'border-2 border-veto-black text-veto-black hover:bg-veto-black hover:text-white',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'btn', // uses base .btn class from index.css
      lg: 'px-10 py-5 text-lg',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'btn pill-shadow outline-none',
          variants[variant],
          size !== 'md' && sizes[size],
          className
        )}
        {...props as any}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
