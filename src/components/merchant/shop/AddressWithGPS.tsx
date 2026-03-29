"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { geocodeAddress } from "@/actions/shop";

interface AddressWithGPSProps {
  address: string;
  postalCode: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  onAddressChange: (value: string) => void;
  onPostalCodeChange: (value: string) => void;
  onCityChange: (value: string) => void;
}

export function AddressWithGPS({
  address,
  postalCode,
  city,
  latitude,
  longitude,
  onAddressChange,
  onPostalCodeChange,
  onCityChange,
}: AddressWithGPSProps) {
  const [isPending, startTransition] = useTransition();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    latitude && longitude ? { lat: latitude, lng: longitude } : null,
  );
  const [geoError, setGeoError] = useState("");

  function handleGeocode() {
    if (!address || !postalCode || !city) {
      setGeoError("Remplissez l'adresse, le code postal et la ville");
      return;
    }
    setGeoError("");
    startTransition(async () => {
      const result = await geocodeAddress(address, postalCode, city);
      if ("error" in result) {
        setGeoError(result.error);
      } else {
        setCoords(result);
      }
    });
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-text">Adresse</h2>
      <Input
        label="Adresse"
        value={address}
        onChange={(e) => onAddressChange(e.target.value)}
        placeholder="12 rue de la Paix"
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Code postal"
          value={postalCode}
          onChange={(e) => onPostalCodeChange(e.target.value)}
          placeholder="75001"
        />
        <Input
          label="Ville"
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          placeholder="Paris"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          loading={isPending}
          onClick={handleGeocode}
        >
          Geocoder
        </Button>
        {coords && (
          <span className="text-xs text-green">
            GPS: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </span>
        )}
      </div>
      {geoError && (
        <p className="text-xs text-red">{geoError}</p>
      )}
    </section>
  );
}
