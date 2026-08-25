export const bookingReference = (id?: string, reference?: string): string => {
    if (reference) return reference;
    if (!id) return 'Pending';
    return `DP-${id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
};
