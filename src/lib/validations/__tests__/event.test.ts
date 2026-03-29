import { describe, it, expect } from "vitest";
import { eventSchema } from "../event";

describe("eventSchema", () => {
  it("accepts valid event data", () => {
    const result = eventSchema.safeParse({
      title: "Marche de Noel",
      description: "Grand marche annuel",
      eventType: "marche",
      eventDate: new Date("2026-12-20"),
      eventTime: "09:00",
      endTime: "18:00",
      address: "Place de la Mairie",
      isRecurring: false,
      isPrivate: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty title", () => {
    const result = eventSchema.safeParse({
      title: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts minimal data (title only)", () => {
    const result = eventSchema.safeParse({
      title: "Atelier cuisine",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid event type", () => {
    const result = eventSchema.safeParse({
      title: "Test",
      eventType: "invalid_type",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid time format", () => {
    const result = eventSchema.safeParse({
      title: "Test",
      eventTime: "9h30",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid time format", () => {
    const result = eventSchema.safeParse({
      title: "Test",
      eventTime: "09:30",
    });
    expect(result.success).toBe(true);
  });

  it("accepts recurring event", () => {
    const result = eventSchema.safeParse({
      title: "Marche hebdo",
      isRecurring: true,
      recurringDay: "samedi",
      recurringDays: "samedi,dimanche",
    });
    expect(result.success).toBe(true);
  });

  it("accepts private event", () => {
    const result = eventSchema.safeParse({
      title: "Degustation privee",
      eventType: "degustation",
      isPrivate: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects too long description", () => {
    const result = eventSchema.safeParse({
      title: "Test",
      description: "a".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("coerces string date to Date", () => {
    const result = eventSchema.safeParse({
      title: "Test",
      eventDate: "2026-12-20",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.eventDate).toBeInstanceOf(Date);
    }
  });
});
