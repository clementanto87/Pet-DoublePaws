import React from 'react';
import { motion } from 'framer-motion';
import { PawPrint } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PawPrintsProps {
    className?: string;
    variant?: 'walking' | 'floating';
}

export const PawPrints: React.FC<PawPrintsProps> = ({ className, variant = 'walking' }) => {
    // Generate random positions for floating paws
    const floatingPaws = Array.from({ length: 5 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 3 + Math.random() * 2,
        rotate: Math.random() * 360,
    }));

    if (variant === 'floating') {
        return (
            <div className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}>
                {floatingPaws.map((paw) => (
                    <motion.div
                        key={paw.id}
                        className="absolute text-primary/30 dark:text-primary/20"
                        initial={{
                            left: `${paw.x}%`,
                            top: '100%',
                            opacity: 0,
                            rotate: paw.rotate
                        }}
                        animate={{
                            top: '-10%',
                            opacity: [0, 1, 0],
                            rotate: paw.rotate + 45
                        }}
                        transition={{
                            duration: paw.duration,
                            repeat: Infinity,
                            delay: paw.delay,
                            ease: "linear"
                        }}
                    >
                        <PawPrint size={24 + Math.random() * 24} />
                    </motion.div>
                ))}
            </div>
        );
    }

    // Walking animation (bottom right to top left)
    const walkingPaws = Array.from({ length: 6 }).map((_, i) => ({
        id: i,
        delay: i * 0.5,
    }));

    return (
        <div className={cn("absolute inset-0 pointer-events-none overflow-hidden z-0", className)}>
            {walkingPaws.map((paw, i) => (
                <motion.div
                    key={paw.id}
                    className="absolute text-primary/40 dark:text-primary/30"
                    initial={{
                        opacity: 0,
                        scale: 0
                    }}
                    animate={{
                        opacity: [0, 1, 0],
                        scale: [0.5, 1, 0.8],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: paw.delay,
                        repeatDelay: 4 // Wait for the whole sequence to finish
                    }}
                    style={{
                        left: `${10 + (i * 8)}%`,
                        bottom: `${10 + (i * 8)}%`,
                        transform: `rotate(-45deg)` // Rotate to match the walking direction
                    }}
                >
                    <PawPrint
                        size={32}
                        className={cn(
                            "transform",
                            i % 2 === 0 ? "rotate-12" : "-rotate-12" // Alternate left/right steps
                        )}
                    />
                </motion.div>
            ))}
        </div>
    );
};
