import React from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> { }

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div className="relative">
                <select
                    className={cn(
                        "flex h-12 w-full appearance-none rounded-xl border border-input bg-white/50 dark:bg-white/5 px-4 py-2 pr-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 backdrop-blur-sm shadow-sm hover:bg-white/80 dark:hover:bg-white/10",
                        className
                    )}
                    ref={ref}
                    {...props}
                >
                    {children}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
            </div>
        );
    }
);
Select.displayName = "Select";

export { Select };
