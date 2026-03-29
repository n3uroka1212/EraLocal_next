"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/ui/FileUpload";
import { toast } from "@/components/ui/Toast";
import {
  updateCityProfile,
  uploadCityLogo,
  deleteCityLogo,
  uploadCityBanner,
  deleteCityBanner,
} from "@/actions/city";

const DEPARTMENTS = [
  { value: "", label: "-- Choisir --" },
  { value: "01", label: "01 - Ain" },
  { value: "02", label: "02 - Aisne" },
  { value: "03", label: "03 - Allier" },
  { value: "04", label: "04 - Alpes-de-Haute-Provence" },
  { value: "05", label: "05 - Hautes-Alpes" },
  { value: "06", label: "06 - Alpes-Maritimes" },
  { value: "07", label: "07 - Ardeche" },
  { value: "08", label: "08 - Ardennes" },
  { value: "09", label: "09 - Ariege" },
  { value: "10", label: "10 - Aube" },
  { value: "11", label: "11 - Aude" },
  { value: "12", label: "12 - Aveyron" },
  { value: "13", label: "13 - Bouches-du-Rhone" },
  { value: "14", label: "14 - Calvados" },
  { value: "15", label: "15 - Cantal" },
  { value: "16", label: "16 - Charente" },
  { value: "17", label: "17 - Charente-Maritime" },
  { value: "18", label: "18 - Cher" },
  { value: "19", label: "19 - Correze" },
  { value: "2A", label: "2A - Corse-du-Sud" },
  { value: "2B", label: "2B - Haute-Corse" },
  { value: "21", label: "21 - Cote-d'Or" },
  { value: "22", label: "22 - Cotes-d'Armor" },
  { value: "23", label: "23 - Creuse" },
  { value: "24", label: "24 - Dordogne" },
  { value: "25", label: "25 - Doubs" },
  { value: "26", label: "26 - Drome" },
  { value: "27", label: "27 - Eure" },
  { value: "28", label: "28 - Eure-et-Loir" },
  { value: "29", label: "29 - Finistere" },
  { value: "30", label: "30 - Gard" },
  { value: "31", label: "31 - Haute-Garonne" },
  { value: "32", label: "32 - Gers" },
  { value: "33", label: "33 - Gironde" },
  { value: "34", label: "34 - Herault" },
  { value: "35", label: "35 - Ille-et-Vilaine" },
  { value: "36", label: "36 - Indre" },
  { value: "37", label: "37 - Indre-et-Loire" },
  { value: "38", label: "38 - Isere" },
  { value: "39", label: "39 - Jura" },
  { value: "40", label: "40 - Landes" },
  { value: "41", label: "41 - Loir-et-Cher" },
  { value: "42", label: "42 - Loire" },
  { value: "43", label: "43 - Haute-Loire" },
  { value: "44", label: "44 - Loire-Atlantique" },
  { value: "45", label: "45 - Loiret" },
  { value: "46", label: "46 - Lot" },
  { value: "47", label: "47 - Lot-et-Garonne" },
  { value: "48", label: "48 - Lozere" },
  { value: "49", label: "49 - Maine-et-Loire" },
  { value: "50", label: "50 - Manche" },
  { value: "51", label: "51 - Marne" },
  { value: "52", label: "52 - Haute-Marne" },
  { value: "53", label: "53 - Mayenne" },
  { value: "54", label: "54 - Meurthe-et-Moselle" },
  { value: "55", label: "55 - Meuse" },
  { value: "56", label: "56 - Morbihan" },
  { value: "57", label: "57 - Moselle" },
  { value: "58", label: "58 - Nievre" },
  { value: "59", label: "59 - Nord" },
  { value: "60", label: "60 - Oise" },
  { value: "61", label: "61 - Orne" },
  { value: "62", label: "62 - Pas-de-Calais" },
  { value: "63", label: "63 - Puy-de-Dome" },
  { value: "64", label: "64 - Pyrenees-Atlantiques" },
  { value: "65", label: "65 - Hautes-Pyrenees" },
  { value: "66", label: "66 - Pyrenees-Orientales" },
  { value: "67", label: "67 - Bas-Rhin" },
  { value: "68", label: "68 - Haut-Rhin" },
  { value: "69", label: "69 - Rhone" },
  { value: "70", label: "70 - Haute-Saone" },
  { value: "71", label: "71 - Saone-et-Loire" },
  { value: "72", label: "72 - Sarthe" },
  { value: "73", label: "73 - Savoie" },
  { value: "74", label: "74 - Haute-Savoie" },
  { value: "75", label: "75 - Paris" },
  { value: "76", label: "76 - Seine-Maritime" },
  { value: "77", label: "77 - Seine-et-Marne" },
  { value: "78", label: "78 - Yvelines" },
  { value: "79", label: "79 - Deux-Sevres" },
  { value: "80", label: "80 - Somme" },
  { value: "81", label: "81 - Tarn" },
  { value: "82", label: "82 - Tarn-et-Garonne" },
  { value: "83", label: "83 - Var" },
  { value: "84", label: "84 - Vaucluse" },
  { value: "85", label: "85 - Vendee" },
  { value: "86", label: "86 - Vienne" },
  { value: "87", label: "87 - Haute-Vienne" },
  { value: "88", label: "88 - Vosges" },
  { value: "89", label: "89 - Yonne" },
  { value: "90", label: "90 - Territoire de Belfort" },
  { value: "91", label: "91 - Essonne" },
  { value: "92", label: "92 - Hauts-de-Seine" },
  { value: "93", label: "93 - Seine-Saint-Denis" },
  { value: "94", label: "94 - Val-de-Marne" },
  { value: "95", label: "95 - Val-d'Oise" },
  { value: "971", label: "971 - Guadeloupe" },
  { value: "972", label: "972 - Martinique" },
  { value: "973", label: "973 - Guyane" },
  { value: "974", label: "974 - La Reunion" },
  { value: "976", label: "976 - Mayotte" },
];

interface CityProfileClientProps {
  city: {
    id: number;
    name: string;
    description: string | null;
    department: string | null;
    region: string | null;
    slogan: string | null;
    cityCategory: string | null;
    contactName: string | null;
    phone: string | null;
    logo: string | null;
    logoEmoji: string | null;
    banner: string | null;
  };
}

export function CityProfileClient({ city }: CityProfileClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(city.name);
  const [description, setDescription] = useState(city.description ?? "");
  const [department, setDepartment] = useState(city.department ?? "");
  const [region, setRegion] = useState(city.region ?? "");
  const [slogan, setSlogan] = useState(city.slogan ?? "");
  const [cityCategory, setCityCategory] = useState(city.cityCategory ?? "");
  const [contactName, setContactName] = useState(city.contactName ?? "");
  const [phone, setPhone] = useState(city.phone ?? "");

  function handleSubmit() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("description", description);
      formData.set("department", department);
      formData.set("region", region);
      formData.set("slogan", slogan);
      formData.set("cityCategory", cityCategory);
      formData.set("contactName", contactName);
      formData.set("phone", phone);

      const result = await updateCityProfile(null, formData);
      if (result.error) {
        toast("error", result.error);
      } else {
        toast("success", "Profil mis a jour");
      }
    });
  }

  function handleBannerUpload(file: File) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("banner", file);
      const result = await uploadCityBanner(formData);
      if (result.error) {
        toast("error", result.error);
      } else {
        toast("success", "Banniere mise a jour");
        router.refresh();
      }
    });
  }

  function handleBannerDelete() {
    startTransition(async () => {
      const result = await deleteCityBanner();
      if (result.error) {
        toast("error", result.error);
      } else {
        toast("success", "Banniere supprimee");
        router.refresh();
      }
    });
  }

  function handleLogoUpload(file: File) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("logo", file);
      const result = await uploadCityLogo(formData);
      if (result.error) {
        toast("error", result.error);
      } else {
        toast("success", "Logo mis a jour");
        router.refresh();
      }
    });
  }

  function handleLogoDelete() {
    startTransition(async () => {
      const result = await deleteCityLogo();
      if (result.error) {
        toast("error", result.error);
      } else {
        toast("success", "Logo supprime");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Banner */}
      <section>
        <h2 className="text-lg font-semibold text-text mb-3">Banniere</h2>
        <FileUpload
          label={isPending ? "Envoi en cours..." : "Choisir une banniere"}
          preview={city.banner}
          onUpload={handleBannerUpload}
          onRemove={handleBannerDelete}
        />
      </section>

      {/* Logo */}
      <section>
        <h2 className="text-lg font-semibold text-text mb-3">Logo</h2>
        <div className="flex items-center gap-4">
          {city.logo ? (
            <div className="relative">
              <img
                src={city.logo}
                alt="Logo"
                className="w-20 h-20 rounded-card object-cover border border-border"
              />
              <button
                onClick={handleLogoDelete}
                disabled={isPending}
                className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center rounded-full bg-red text-white text-xs hover:opacity-90 transition-opacity disabled:opacity-50"
                aria-label="Supprimer le logo"
              >
                &#x2715;
              </button>
            </div>
          ) : (
            <div className="w-20 h-20 rounded-card bg-bg3 border border-border flex items-center justify-center text-3xl">
              {city.logoEmoji || "\uD83C\uDFD9\uFE0F"}
            </div>
          )}
          <FileUpload
            label={isPending ? "Envoi..." : "Changer le logo"}
            onUpload={handleLogoUpload}
            className="flex-1"
          />
        </div>
      </section>

      {/* General info */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text">
          Informations generales
        </h2>
        <Input
          label="Nom de la ville"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Presentez votre ville..."
          rows={4}
        />
        <Input
          label="Slogan"
          value={slogan}
          onChange={(e) => setSlogan(e.target.value)}
          placeholder="Ex: Ville fleurie au coeur de la Provence"
        />
        <Input
          label="Categorie de ville"
          value={cityCategory}
          onChange={(e) => setCityCategory(e.target.value)}
          placeholder="Ex: Village, Commune, Metropole..."
        />
      </section>

      {/* Location */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text">Localisation</h2>
        <Select
          label="Departement"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          options={DEPARTMENTS}
        />
        <Input
          label="Region"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="Ex: Provence-Alpes-Cote d'Azur"
        />
      </section>

      {/* Contact */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text">Contact</h2>
        <Input
          label="Nom du contact"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          placeholder="Responsable de la communication"
        />
        <Input
          label="Telephone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="06 12 34 56 78"
        />
      </section>

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <Button onClick={handleSubmit} loading={isPending}>
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
