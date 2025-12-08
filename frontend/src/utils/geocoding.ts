/**
 * Geocoding utilities using OpenStreetMap Nominatim API
 * Free service with no API key required
 */

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

/**
 * Get user's current position using browser geolocation API
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
 * Convert coordinates to address using reverse geocoding
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<Address> => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'DoublePaws-PetCare-App',
                },
            }
        );

        if (!response.ok) {
            throw new Error('Reverse geocoding failed');
        }

        const data = await response.json();

        return {
            display_name: data.display_name,
            city: data.address?.city || data.address?.town || data.address?.village,
            state: data.address?.state,
            country: data.address?.country,
            coordinates: { lat, lng },
        };
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        throw new Error('Failed to get address from coordinates');
    }
};

/**
 * Search for addresses based on query string
 */
export const searchAddresses = async (query: string): Promise<Address[]> => {
    if (!query || query.length < 3) {
        return [];
    }

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`,
            {
                headers: {
                    'User-Agent': 'DoublePaws-PetCare-App',
                },
            }
        );

        if (!response.ok) {
            throw new Error('Address search failed');
        }

        const data = await response.json();

        return data.map((item: any) => ({
            display_name: item.display_name,
            city: item.address?.city || item.address?.town || item.address?.village,
            state: item.address?.state,
            country: item.address?.country,
            coordinates: {
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
            },
        }));
    } catch (error) {
        console.error('Address search error:', error);
        return [];
    }
};

/**
 * Format address for display (shorter version)
 */
export const formatAddressShort = (address: Address): string => {
    const parts = [];
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    return parts.join(', ') || address.display_name;
};
