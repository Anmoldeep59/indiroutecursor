import { FROZEN } from "@/lib/config/frozen";
import { getFounderSettings } from "@/lib/config/founder-settings";
import { differenceInCalendarDays, parseISO, startOfDay } from "date-fns";

export function storageDayNumber(storedAt: string, now = new Date()): number {
  const start = startOfDay(parseISO(storedAt));
  const today = startOfDay(now);
  return differenceInCalendarDays(today, start) + 1;
}

export function freeDaysRemaining(storedAt: string, now = new Date()): number {
  const day = storageDayNumber(storedAt, now);
  return Math.max(0, FROZEN.freeStorageDays - day + 1);
}

export function billableStorageDays(storedAt: string, now = new Date()): number {
  const day = storageDayNumber(storedAt, now);
  if (day <= FROZEN.freeStorageDays) return 0;
  return day - FROZEN.freeStorageDays;
}

export function storageDueInr(storedAt: string, now = new Date()): number {
  return billableStorageDays(storedAt, now) * FROZEN.storageFeeInrPerDay;
}

/** AUD cents for checkout — requires founder conversion rule */
export function storageDueAudCents(storedAt: string, now = new Date()): number | null {
  const settings = getFounderSettings();
  if (settings.storageAudCentsPerDay === null) return null;
  return billableStorageDays(storedAt, now) * settings.storageAudCentsPerDay;
}

export function shouldSendStorageWarning(
  storedAt: string,
  alreadySent: number[],
  now = new Date(),
): number | null {
  const day = storageDayNumber(storedAt, now);
  for (const warnDay of FROZEN.storageWarningDays) {
    if (day === warnDay && !alreadySent.includes(warnDay)) return warnDay;
  }
  return null;
}

export function storageChargesStarted(storedAt: string, now = new Date()): boolean {
  return storageDayNumber(storedAt, now) >= FROZEN.freeStorageDays + 1;
}
