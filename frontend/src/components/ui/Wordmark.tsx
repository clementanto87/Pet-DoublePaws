import React from 'react';
import { cn } from '../../lib/utils';

interface WordmarkProps {
    className?: string;
}

// The brand wordmark, kept in one place so every lockup (navbar, footer,
// admin) renders it identically. "Double Paws" carries the brand gradient
// and "24" trails as a muted suffix, matching the doublepaws24.com domain.
export const Wordmark: React.FC<WordmarkProps> = ({ className }) => (
    <span className={cn('font-display font-bold whitespace-nowrap', className)}>
        <span className="text-gradient">Double Paws</span>
        <span className="ml-1 text-muted-foreground">24</span>
    </span>
);

export default Wordmark;
