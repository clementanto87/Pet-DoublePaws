import React from 'react';
import { PawPrint } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LogoProps {
    className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
    return (
        <div className={cn("relative w-14 h-10", className)}>
            {/* Blue Paw (Back) */}
            <div className="absolute left-0 top-1 transform -rotate-12">
                <PawPrint
                    className="w-8 h-8 text-secondary fill-secondary"
                    strokeWidth={1.5}
                />
            </div>

            {/* Orange Paw (Front) with white outline/halo */}
            <div className="absolute right-0 top-0 transform rotate-12">
                {/* White halo for separation */}
                <PawPrint
                    className="absolute w-8 h-8 text-background stroke-background"
                    strokeWidth={6}
                />
                {/* Actual Orange Paw */}
                <PawPrint
                    className="relative w-8 h-8 text-primary fill-primary"
                    strokeWidth={1.5}
                />
            </div>
        </div>
    );
};
