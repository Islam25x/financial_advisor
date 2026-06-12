import { describe, expect, it, vi } from "vitest";
import {
  getCurrentTransactionTimestamp,
  normalizeTransactionCreationTimestamp,
  normalizeTransactionLocalInputTimestamp,
} from "./transaction-dates";

describe("transaction creation timestamp helpers", () => {
  it("normalizes manual local datetime input to UTC", () => {
    expect(normalizeTransactionLocalInputTimestamp("2026-05-03T00:30")).toBe(
      new Date(2026, 4, 3, 0, 30, 0, 0).toISOString(),
    );
  });

  it("treats AI datetimes without timezone as local input rather than UTC", () => {
    expect(normalizeTransactionCreationTimestamp("2026-05-03T00:30")).toBe(
      new Date(2026, 4, 3, 0, 30, 0, 0).toISOString(),
    );
  });

  it("keeps explicit UTC timestamps unchanged", () => {
    expect(normalizeTransactionCreationTimestamp("2026-05-02T21:00:00Z")).toBe(
      "2026-05-02T21:00:00.000Z",
    );
  });

  it("uses the current local time when AI only provides a date", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-03T08:15:00.000Z"));

    const now = new Date();
    const expected = new Date(
      2026,
      4,
      10,
      now.getHours(),
      now.getMinutes(),
      0,
      0,
    ).toISOString();

    expect(normalizeTransactionCreationTimestamp("2026-05-10")).toBe(expected);

    vi.useRealTimers();
  });

  it("falls back to the current timestamp when no time is provided at all", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-03T08:15:00.000Z"));

    expect(normalizeTransactionCreationTimestamp()).toBe(
      getCurrentTransactionTimestamp(),
    );

    vi.useRealTimers();
  });
});
