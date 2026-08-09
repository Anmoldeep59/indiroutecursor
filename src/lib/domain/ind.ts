import { FROZEN } from "@/lib/config/frozen";
import { getFounderSettings } from "@/lib/config/founder-settings";

const IND_REGEX = /^IND-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/;

export function getIndAlphabet(): string {
  return getFounderSettings().indAlphabet || FROZEN.defaultIndAlphabet;
}

export function generateIndId(randomBytes?: Uint8Array): string {
  const alphabet = getIndAlphabet();
  const body = new Array(FROZEN.indBodyLength);
  const bytes =
    randomBytes ??
    (typeof crypto !== "undefined"
      ? crypto.getRandomValues(new Uint8Array(FROZEN.indBodyLength))
      : Uint8Array.from({ length: FROZEN.indBodyLength }, () =>
          Math.floor(Math.random() * 256),
        ));

  for (let i = 0; i < FROZEN.indBodyLength; i++) {
    body[i] = alphabet[bytes[i]! % alphabet.length];
  }
  return `${FROZEN.indPrefix}${body.join("")}`;
}

export function isValidIndId(value: string): boolean {
  const alphabet = getIndAlphabet();
  const escaped = alphabet.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  const re = new RegExp(`^IND-[${escaped}]{${FROZEN.indBodyLength}}$`);
  return re.test(value.toUpperCase());
}

export function normalizeIndId(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase();
}

export function extractIndFromText(text: string): string | null {
  const match = text.toUpperCase().match(/IND-[A-Z0-9]{6}/);
  if (!match) return null;
  const candidate = match[0];
  return isValidIndId(candidate) ? candidate : null;
}

/** Default regex for docs; runtime validation uses founder alphabet */
export const IND_FORMAT_DOC = IND_REGEX;
