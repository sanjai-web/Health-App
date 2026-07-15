import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export interface AirQualityData {
  aqi: number | null;
  city: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAirQuality(): AirQualityData {
  const [aqi, setAqi] = useState<number | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAqiData = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch AQI data');
      }
      const data = await response.json();
      if (data && data.current && typeof data.current.us_aqi === 'number') {
        setAqi(data.current.us_aqi);
      } else {
        throw new Error('Invalid AQI data format');
      }
    } catch (err: any) {
      console.error('Error fetching AQI:', err);
      setError('AQI fetch failed');
    }
  };

  const getAirQuality = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        setLoading(false);
        return;
      }

      // 2. Get coords
      // Try to get fast last known position first to improve user experience
      let loc = await Location.getLastKnownPositionAsync({});
      if (!loc) {
        loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      }

      const { latitude, longitude } = loc.coords;

      // 3. Reverse geocode to get city name asynchronously (don't block AQI fetch)
      Location.reverseGeocodeAsync({ latitude, longitude })
        .then((geocode) => {
          if (geocode && geocode.length > 0) {
            const match = geocode[0];
            const name = match.city || match.district || match.subregion || match.name;
            if (name) {
              setCity(name);
              return;
            }
          }
          setCity(`Lat: ${latitude.toFixed(1)}, Lon: ${longitude.toFixed(1)}`);
        })
        .catch((err) => {
          console.warn('Reverse geocoding failed:', err);
          setCity(`Lat: ${latitude.toFixed(1)}, Lon: ${longitude.toFixed(1)}`);
        });

      // 4. Fetch AQI
      await fetchAqiData(latitude, longitude);
    } catch (err: any) {
      console.error('Error getting location or air quality:', err);
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAirQuality();
  }, []);

  return { aqi, city, loading, error, refetch: getAirQuality };
}
