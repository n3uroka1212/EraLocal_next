"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { EventCard, type EventItem } from "./EventCard";
import { EventForm, type EventFormData } from "./EventForm";
import { deleteEvent, updateEvent } from "@/actions/events";

interface EventsManagementClientProps {
  events: EventItem[];
}

function eventToFormData(event: EventItem): EventFormData {
  return {
    id: event.id,
    title: event.title,
    description: event.description ?? "",
    eventType: event.eventType ?? "",
    eventDate: event.eventDate
      ? new Date(event.eventDate).toISOString().split("T")[0]
      : "",
    eventTime: event.eventTime ?? "",
    endTime: event.endTime ?? "",
    address: event.address ?? "",
    phone: event.phone ?? "",
    website: event.website ?? "",
    isRecurring: event.isRecurring,
    recurringDay: event.recurringDay ?? "",
    recurringDays: event.recurringDays ?? "",
    isPrivate: event.isPrivate,
    active: event.active,
  };
}

export function EventsManagementClient({ events }: EventsManagementClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventFormData | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<EventItem | null>(null);

  function handleCreate() {
    setEditingEvent(undefined);
    setShowFormModal(true);
  }

  function handleEdit(event: EventItem) {
    setEditingEvent(eventToFormData(event));
    setShowFormModal(true);
  }

  function handleFormSuccess() {
    setShowFormModal(false);
    setEditingEvent(undefined);
    router.refresh();
  }

  function handleFormCancel() {
    setShowFormModal(false);
    setEditingEvent(undefined);
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    const eventId = deleteTarget.id;
    setDeleteTarget(null);
    startTransition(async () => {
      await deleteEvent(eventId);
      router.refresh();
    });
  }

  function handleToggleActive(event: EventItem, active: boolean) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("title", event.title);
      formData.set("active", String(active));
      if (event.description) formData.set("description", event.description);
      if (event.eventType) formData.set("eventType", event.eventType);
      if (event.eventDate) formData.set("eventDate", event.eventDate);
      if (event.eventTime) formData.set("eventTime", event.eventTime);
      if (event.endTime) formData.set("endTime", event.endTime);
      if (event.address) formData.set("address", event.address);
      if (event.phone) formData.set("phone", event.phone);
      if (event.website) formData.set("website", event.website);
      formData.set("isRecurring", String(event.isRecurring));
      if (event.recurringDay) formData.set("recurringDay", event.recurringDay);
      if (event.recurringDays) formData.set("recurringDays", event.recurringDays);
      formData.set("isPrivate", String(event.isPrivate));

      await updateEvent(event.id, null, formData);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-serif text-text">Evenements</h1>
        <Button onClick={handleCreate}>+ Creer un evenement</Button>
      </div>

      {/* Events list */}
      {events.length > 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-text2">
            {events.length} evenement{events.length > 1 ? "s" : ""}
          </p>
          <div className="space-y-3">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={() => handleEdit(event)}
                onDelete={() => setDeleteTarget(event)}
                onToggleActive={(active) => handleToggleActive(event, active)}
                isPending={isPending}
              />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon="📅"
          title="Aucun evenement"
          description="Creez votre premier evenement pour attirer des clients dans votre boutique."
          action={
            <Button onClick={handleCreate}>Creer un evenement</Button>
          }
        />
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={showFormModal}
        onClose={handleFormCancel}
        title={editingEvent ? "Modifier l'evenement" : "Nouvel evenement"}
        className="max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <EventForm
          key={editingEvent?.id ?? "new"}
          initialData={editingEvent}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Supprimer l'evenement"
        message={`Etes-vous sur de vouloir supprimer "${deleteTarget?.title}" ? Cette action est irreversible.`}
        confirmLabel="Supprimer"
        variant="danger"
        loading={isPending}
      />
    </div>
  );
}
