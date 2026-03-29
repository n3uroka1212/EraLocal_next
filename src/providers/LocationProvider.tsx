"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

type LocationContextType = {
  latitude: number | null;
  longitude: number | null;
  radius: number;
  loading: boolean;
  error: string | null;
  requestLocation: () => void;
  setRadius: (km: number) => void;
  setManualPosition: (lat: number, lng: number) => void;
};

const LocationContext = createContext<LocationContextType>({
  latitude: null,
  longitude: null,
  radius: 20,
  loading: false,
  error: null,
  requestLocation: () => {},
  setRadius: () => {},
  setManualPosition: () => {},
});

export function LocationProvider({ children }: { children: ReactNode }) {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [radius, setRadiusState] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocalisation non supportee");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLoading(false);
      },
      (err) => {
        setError(
          err.code === 1
            ? "Permission refusee"
            : "Impossible d'obtenir la position",
        );
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }, []);

  const setRadius = useCallback((km: number) => {
    setRadiusState(Math.max(1, Math.min(100, km)));
  }, []);

  const setManualPosition = useCallback((lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  }, []);

  return (
    <LocationContext.Provider
      value={{
        latitude,
        longitude,
        radius,
        loading,
        error,
        requestLocation,
        setRadius,
        setManualPosition,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation(): LocationContextType {
  return useContext(LocationContext);
}
