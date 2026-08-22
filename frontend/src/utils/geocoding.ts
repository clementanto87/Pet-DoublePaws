/**
 * Geocoding utilities using the Photon API (https://photon.komoot.io).
 *
 * Photon is an OpenStreetMap-based geocoder purpose-built for type-ahead /
 * autocomplete search — unlike Nominatim, whose usage policy discourages
 * autocomplete. It needs no API key. Results are returned as GeoJSON.
 */

import i18n from '../i18n/i18n';

const PHOTON_BASE = 'https://photon.komoot.io';

export interface Coordinates {
    lat: number;
    lng: number;
}

export interface Address {
    display_name: string;
    city?: string;
    state?: string;
    country?: string;
    coordinates: Coordinates;
}

// Photon supports a limited set of UI languages; fall back to English otherwise.
const photonLang = (): string => {
    const lng = (i18n.language || 'en').slice(0, 2);
    return ['en', 'de', 'fr'].includes(lng) ? lng : 'en';
};

interface PhotonProps {
    name?: string;
    street?: string;
    housenumber?: string;
    postcode?: string;
    city?: string;
    district?: string;
    county?: string;
    state?: string;
    country?: string;
    type?: string;
}

// Build a readable single-line address from Photon's structured properties.
const buildDisplayName = (p: PhotonProps): string => {
    const segments: string[] = [];
    if (p.name) segments.push(p.name);
    if (p.street && p.street !== p.name) {
        segments.push(p.housenumber ? `${p.street} ${p.housenumber}` : p.street);
    }
    const city = p.city || p.district || p.county;
    if (city && city !== p.name) segments.push(city);
    if (p.state && p.state !== city) segments.push(p.state);
    if (p.country) segments.push(p.country);
    // De-duplicate while preserving order
    return [...new Set(segments)].filter(Boolean).join(', ');
};

const featureToAddress = (feature: any): Address => {
    const p: PhotonProps = feature.properties || {};
    const [lng, lat] = feature.geometry?.coordinates || [0, 0];
    const city = p.city || p.district || p.county || (p.type === 'city' ? p.name : undefined);
    return {
        display_name: buildDisplayName(p),
        city,
        state: p.state,
        country: p.country,
        coordinates: { lat, lng },
    };
};

/**
 * Get the user's current position using the browser geolocation API.
 */
export const getCurrentPosition = (): Promise<Coordinates> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            (error) => {
                let errorMessage = 'Unable to retrieve your location';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out.';
                        break;
                }
                reject(new Error(errorMessage));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    });
};

/**
 * Convert coordinates to an address (reverse geocoding).
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<Address> => {
    try {
        const response = await fetch(
            `${PHOTON_BASE}/reverse?lat=${lat}&lon=${lng}&lang=${photonLang()}`
        );

        if (!response.ok) {
            throw new Error('Reverse geocoding failed');
        }

        const data = await response.json();
        const feature = data.features?.[0];
        if (!feature) {
            return { display_name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, coordinates: { lat, lng } };
        }
        // Prefer the real coordinates the caller passed in.
        return { ...featureToAddress(feature), coordinates: { lat, lng } };
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        throw new Error('Failed to get address from coordinates');
    }
};

/**
 * Search for addresses / places matching a query string (autocomplete).
 */
export const searchAddresses = async (query: string): Promise<Address[]> => {
    if (!query || query.length < 3) {
        return [];
    }

    try {
        const response = await fetch(
            `${PHOTON_BASE}/api/?q=${encodeURIComponent(query)}&limit=5&lang=${photonLang()}`
        );

        if (!response.ok) {
            throw new Error('Address search failed');
        }

        const data = await response.json();
        return (data.features || [])
            .map(featureToAddress)
            .filter((a: Address) => a.display_name);
    } catch (error) {
        console.error('Address search error:', error);
        return [];
    }
};

/**
 * Format an address for compact display.
 */
export const formatAddressShort = (address: Address): string => {
    const parts = [];
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    return parts.join(', ') || address.display_name;
};
