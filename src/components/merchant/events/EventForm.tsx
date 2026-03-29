"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { RecurrenceSelector } from "./RecurrenceSelector";
import { createEvent, updateEvent } from "@/actions/events";

const EVENT_TYPE_OPTIONS = [
  { value: "marche", label: "Marche" },
  { value: "degustation", label: "Degustation" },
  { value: "atelier", label: "Atelier" },
  { value: "autre", label: "Autre" },
];

export interface EventFormData {
  id?: number;
  title: string;
  description: string;
  eventType: string;
  eventDate: string;
  eventTime: string;
  endTime: string;
  address: string;
  phone: string;
  website: string;
  isRecurring: boolean;
  recurringDay: string;
  recurringDays: string;
  isPrivate: boolean;
  active: boolean;
}

interface EventFormProps {
  initialData?: EventFormData;
  onSuccess: () => void;
  onCancel: () => void;
}

const defaultData: EventFormData = {
  title: "",
  description: "",
  eventType: "",
  eventDate: "",
  eventTime: "",
  endTime: "",
  address: "",
  phone: "",
  website: "",
  isRecurring: false,
  recurringDay: "",
  recurringDays: "",
  isPrivate: false,
  active: true,
};

export function EventForm({ initialData, onSuccess, onCancel }: EventFormProps) {
  const isEditing = !!initialData?.id;

  const boundAction = isEditing
    ? updateEvent.bind(null, initialData!.id!)
    : createEvent;

  const [state, formAction, isPending] = useActionState(boundAction, null);
  const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring ?? false);
  const [isPrivate, setIsPrivate] = useState(initialData?.isPrivate ?? false);
  const [recurringDay, setRecurringDay] = useState(initialData?.recurringDay ?? "");
  const [recurringDays, setRecurringDays] = useState(initialData?.recurringDays ?? "");

  const data = initialData ?? defaultData;

  // Watch for success to close form
  if (state?.success) {
    // Use setTimeout to avoid state update during render
    setTimeout(() => onSuccess(), 0);
  }

  return (
    <form action={formAction} className="space-y-5">
      <Input
        label="Titre *"
        name="title"
        defaultValue={data.title}
        placeholder="Nom de l'evenement"
        required
      />

      <Textarea
        label="Description"
        name="description"
        defaultValue={data.description}
        placeholder="Decrivez votre evenement..."
        rows={3}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Type d'evenement"
          name="eventType"
          options={EVENT_TYPE_OPTIONS}
          defaultValue={data.eventType}
          placeholder="Selectionner un type"
        />

        <Input
          label="Date"
          name="eventDate"
          type="date"
          defaultValue={data.eventDate}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Heure de debut"
          name="eventTime"
          type="time"
          defaultValue={data.eventTime}
        />

        <Input
          label="Heure de fin"
          name="endTime"
          type="time"
          defaultValue={data.endTime}
        />
      </div>

      <Input
        label="Adresse"
        name="address"
        defaultValue={data.address}
        placeholder="Adresse de l'evenement"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Telephone"
          name="phone"
          type="tel"
          defaultValue={data.phone}
          placeholder="0612345678"
        />

        <Input
          label="Site web"
          name="website"
          type="url"
          defaultValue={data.website}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-3 pt-2">
        <Toggle
          checked={isRecurring}
          onChange={(val) => setIsRecurring(val)}
          label="Evenement recurrent"
        />
        <input type="hidden" name="isRecurring" value={String(isRecurring)} />

        {isRecurring && (
          <>
            <input type="hidden" name="recurringDay" value={recurringDay} />
            <input type="hidden" name="recurringDays" value={recurringDays} />
            <RecurrenceSelector
              recurringDay={recurringDay}
              recurringDays={recurringDays}
              onRecurringDayChange={setRecurringDay}
              onRecurringDaysChange={setRecurringDays}
            />
          </>
        )}
      </div>

      <div className="pt-2">
        <Toggle
          checked={isPrivate}
          onChange={(val) => setIsPrivate(val)}
          label="Evenement prive (code d'acces)"
        />
        <input type="hidden" name="isPrivate" value={String(isPrivate)} />
      </div>

      {isEditing && (
        <input type="hidden" name="active" value={String(data.active)} />
      )}

      {state?.error && (
        <p className="text-sm text-red bg-red-light rounded-input px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" loading={isPending}>
          {isEditing ? "Mettre a jour" : "Creer l'evenement"}
        </Button>
      </div>
    </form>
  );
}
