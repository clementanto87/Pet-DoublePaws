export const bookingReference = (id: string): string =>
    `DP-${id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
