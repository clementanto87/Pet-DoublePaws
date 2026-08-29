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
    const floatingPaws = [
        { id: 0, x: 12, y: 18, delay: 0, duration: 3.5, rotate: 18, size: 30 },
        { id: 1, x: 34, y: 72, delay: 1.1, duration: 4.2, rotate: 142, size: 42 },
        { id: 2, x: 58, y: 30, delay: 2.2, duration: 3.8, rotate: 238, size: 36 },
        { id: 3, x: 76, y: 62, delay: 3.1, duration: 4.5, rotate: 296, size: 48 },
        { id: 4, x: 88, y: 12, delay: 0.6, duration: 3.2, rotate: 84, size: 34 },
    ].map((paw, i) => ({
        id: i,
        x: paw.x,
        y: paw.y,
        delay: paw.delay,
        duration: paw.duration,
        rotate: paw.rotate,
        size: paw.size,
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
                        <PawPrint size={paw.size} />
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
