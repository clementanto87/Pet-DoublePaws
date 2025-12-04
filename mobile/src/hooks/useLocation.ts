import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return null;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const locationData: LocationData = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      // Get city name
      try {
        const [address] = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        if (address) {
          locationData.city = address.city || undefined;
          locationData.region = address.region || undefined;
        }
      } catch (e) {
        console.log('Error getting address:', e);
      }

      setLocation(locationData);
      return locationData;
    } catch (err) {
      setError('Error getting location');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    location,
    loading,
    error,
    requestLocation,
  };
};

export default useLocation;

