/**
 * Service ID mapping between frontend and backend
 */

export const SERVICE_MAP = {
    boarding: 'boarding',
    housesitting: 'houseSitting',
    visits: 'dropInVisits',
    daycare: 'doggyDayCare',
    walking: 'dogWalking',
} as const;

export type FrontendServiceId = keyof typeof SERVICE_MAP;
export type BackendServiceId = typeof SERVICE_MAP[FrontendServiceId];

/**
 * Map frontend service ID to backend service ID
 */
export const mapServiceToBackend = (frontendId: string): string => {
    return SERVICE_MAP[frontendId as FrontendServiceId] || frontendId;
};

/**
 * Map backend service ID to frontend service ID
 */
export const mapServiceToFrontend = (backendId: string): string => {
    const entry = Object.entries(SERVICE_MAP).find(([_, value]) => value === backendId);
    return entry ? entry[0] : backendId;
};
