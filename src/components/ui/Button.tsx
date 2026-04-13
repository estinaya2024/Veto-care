import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'yellow' | 'black' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'yellow', size = 'md', ...props }, ref) => {
    const variants = {
      yellow: 'btn-yellow',
      black: 'btn-black',
      ghost: 'btn-ghost',
      outline: 'border-2 border-veto-black text-veto-black hover:bg-veto-black hover:text-white',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'btn', // uses base .btn class from index.css
      lg: 'px-10 py-5 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'btn pill-shadow',
          variants[variant],
          size !== 'md' && sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
