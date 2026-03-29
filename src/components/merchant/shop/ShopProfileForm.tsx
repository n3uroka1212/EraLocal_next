"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/ui/FileUpload";
import { BannerUpload } from "./BannerUpload";
import { LogoEditor } from "./LogoEditor";
import { OpeningHoursEditor } from "./OpeningHoursEditor";
import { SocialMediaEditor } from "./SocialMediaEditor";
import { PhotoGallery } from "./PhotoGallery";
import { AddressWithGPS } from "./AddressWithGPS";
import { updateShopProfile } from "@/actions/shop";

interface ShopPhoto {
  id: number;
  url: string;
}

interface ShopProfileFormProps {
  shop: {
    id: number;
    name: string;
    description: string | null;
    category: string | null;
    address: string | null;
    postalCode: string | null;
    city: string | null;
    phone: string | null;
    notificationEmail: string | null;
    website: string | null;
    openingHours: Record<string, unknown> | null;
    socialMedia: Record<string, string> | null;
    logo: string | null;
    logoEmoji: string | null;
    banner: string | null;
    latitude: number | null;
    longitude: number | null;
    photos: ShopPhoto[];
  };
}

export function ShopProfileForm({ shop }: ShopProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState(shop.name);
  const [description, setDescription] = useState(shop.description ?? "");
  const [category, setCategory] = useState(shop.category ?? "");
  const [address, setAddress] = useState(shop.address ?? "");
  const [postalCode, setPostalCode] = useState(shop.postalCode ?? "");
  const [city, setCity] = useState(shop.city ?? "");
  const [phone, setPhone] = useState(shop.phone ?? "");
  const [notificationEmail, setNotificationEmail] = useState(
    shop.notificationEmail ?? "",
  );
  const [website, setWebsite] = useState(shop.website ?? "");
  const [logoEmoji, setLogoEmoji] = useState(shop.logoEmoji ?? "");
  const [openingHours, setOpeningHours] = useState(shop.openingHours);
  const [socialMedia, setSocialMedia] = useState(shop.socialMedia);

  function handleSubmit() {
    setError("");
    setSuccess(false);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("description", description);
      formData.set("category", category);
      formData.set("address", address);
      formData.set("postalCode", postalCode);
      formData.set("city", city);
      formData.set("phone", phone);
      formData.set("notificationEmail", notificationEmail);
      formData.set("website", website);
      formData.set("logoEmoji", logoEmoji);
      if (openingHours) {
        formData.set("openingHours", JSON.stringify(openingHours));
      }
      if (socialMedia) {
        formData.set("socialMedia", JSON.stringify(socialMedia));
      }

      const result = await updateShopProfile(null, formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Banner */}
      <BannerUpload banner={shop.banner} />

      {/* Logo */}
      <LogoEditor
        logo={shop.logo}
        logoEmoji={logoEmoji}
        onEmojiChange={setLogoEmoji}
      />

      {/* Infos generales */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text">
          Informations generales
        </h2>
        <Input
          label="Nom de la boutique"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Decrivez votre boutique..."
          rows={4}
        />
        <Input
          label="Categorie"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Ex: Boulangerie, Fromagerie..."
        />
      </section>

      {/* Adresse */}
      <AddressWithGPS
        address={address}
        postalCode={postalCode}
        city={city}
        latitude={shop.latitude}
        longitude={shop.longitude}
        onAddressChange={setAddress}
        onPostalCodeChange={setPostalCode}
        onCityChange={setCity}
      />

      {/* Contact */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text">Contact</h2>
        <Input
          label="Telephone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="06 12 34 56 78"
        />
        <Input
          label="Email de notification"
          type="email"
          value={notificationEmail}
          onChange={(e) => setNotificationEmail(e.target.value)}
        />
        <Input
          label="Site web"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://..."
        />
      </section>

      {/* Horaires */}
      <OpeningHoursEditor
        value={openingHours}
        onChange={setOpeningHours}
      />

      {/* Reseaux sociaux */}
      <SocialMediaEditor value={socialMedia} onChange={setSocialMedia} />

      {/* Galerie photos */}
      <PhotoGallery photos={shop.photos} />

      {/* Actions */}
      {error && (
        <p className="text-sm text-red bg-red-light px-3 py-2 rounded-input">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green bg-green-light px-3 py-2 rounded-input">
          Profil mis a jour
        </p>
      )}
      <Button loading={isPending} onClick={handleSubmit} size="lg">
        Sauvegarder
      </Button>
    </div>
  );
}
