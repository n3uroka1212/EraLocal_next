import { PhoneButton } from "@/components/shared/PhoneButton";
import { WebsiteButton } from "@/components/shared/WebsiteButton";
import { GPSButton } from "@/components/shared/GPSButton";

interface ShopContactProps {
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
}

export function ShopContact({
  phone,
  email,
  website,
  latitude,
  longitude,
  address,
}: ShopContactProps) {
  return (
    <div className="space-y-4">
      {address && (
        <div className="flex items-start gap-2 text-sm">
          <span className="text-text3">📍</span>
          <span className="text-text">{address}</span>
        </div>
      )}
      {email && (
        <div className="flex items-start gap-2 text-sm">
          <span className="text-text3">📧</span>
          <a
            href={`mailto:${email}`}
            className="text-terra hover:underline"
          >
            {email}
          </a>
        </div>
      )}
      <div className="flex gap-3">
        {phone && <PhoneButton phone={phone} />}
        {website && <WebsiteButton url={website} />}
        {latitude != null && longitude != null && (
          <GPSButton lat={latitude} lng={longitude} />
        )}
      </div>
    </div>
  );
}
