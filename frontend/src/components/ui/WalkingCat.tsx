import React from 'react';
import { motion } from 'framer-motion';

export const WalkingCat: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <motion.div
            className={className}
            initial={{ x: -10 }}
            animate={{ x: 80 }}
            transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear"
            }}
        >
            <svg viewBox="0 0 100 60" className="w-full h-full">
                {/* Cat Body */}
                <path
                    d="M20,40 Q30,30 60,30 Q80,30 90,40 L90,55 L80,55 L80,45 L70,45 L70,55 L60,55 L60,45 L30,45 L30,55 L20,55 L20,45 L10,45 L10,55 L0,55 L0,40 Z"
                    fill="currentColor"
                    className="text-orange-400"
                />
                {/* Head */}
                <circle cx="85" cy="35" r="10" fill="currentColor" className="text-orange-400" />
                {/* Ears */}
                <path d="M80,28 L78,18 L88,25 Z" fill="currentColor" className="text-orange-400" />
                <path d="M90,28 L92,18 L82,25 Z" fill="currentColor" className="text-orange-400" />
                {/* Tail */}
                <motion.path
                    d="M0,40 Q-10,20 0,10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="text-orange-400"
                    animate={{ d: ["M0,40 Q-10,20 0,10", "M0,40 Q10,20 0,10", "M0,40 Q-10,20 0,10"] }}
                    transition={{ duration: 1, repeat: Infinity }}
                />
                {/* Legs Animation */}
                <motion.g
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 0.2, repeat: Infinity }}
                >
                    <circle cx="87" cy="33" r="1.5" fill="black" />
                </motion.g>
            </svg>
        </motion.div>
    );
};
