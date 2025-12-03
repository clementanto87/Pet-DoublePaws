import React from 'react';
import { motion } from 'framer-motion';

export const SleepingCat: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <motion.svg
            viewBox="0 0 100 60"
            className={className}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Cat Body */}
            <path
                d="M20,50 Q30,20 60,30 Q80,35 90,50 Z"
                fill="currentColor"
                className="text-orange-300"
            />
            {/* Cat Head */}
            <circle cx="25" cy="45" r="12" fill="currentColor" className="text-orange-300" />
            {/* Ears */}
            <path d="M15,38 L12,28 L22,35 Z" fill="currentColor" className="text-orange-300" />
            <path d="M35,38 L38,28 L28,35 Z" fill="currentColor" className="text-orange-300" />
            {/* Sleeping Eyes (Closed) */}
            <path d="M19,43 Q22,46 25,43" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-orange-800" />
            <path d="M28,43 Q31,46 34,43" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-orange-800" />
            {/* Tail */}
            <path
                d="M90,50 Q95,40 85,35"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                className="text-orange-300"
            />
            {/* Zzz Animation */}
            <motion.g
                initial={{ opacity: 0, x: 0, y: 0 }}
                animate={{
                    opacity: [0, 1, 0],
                    x: [0, 10, 20],
                    y: [0, -10, -20],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                <text x="40" y="20" fontSize="10" fill="currentColor" className="text-blue-400 font-bold">Z</text>
            </motion.g>
            <motion.g
                initial={{ opacity: 0, x: 0, y: 0 }}
                animate={{
                    opacity: [0, 1, 0],
                    x: [0, 10, 20],
                    y: [0, -10, -20],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                }}
            >
                <text x="50" y="15" fontSize="8" fill="currentColor" className="text-blue-400 font-bold">z</text>
            </motion.g>
        </motion.svg>
    );
};
