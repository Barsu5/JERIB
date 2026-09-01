import { cityLabel, countryLabel, type CityId, type CountryId } from "@/lib/dispatch/cities";
import type { Lang } from "@/lib/i18n";

export type AddressFields = {
  phone: string;
  line1: string;
  line2: string;
  state: string;
  postalCode: string;
};

export const EMPTY_ADDRESS: AddressFields = {
  phone: "",
  line1: "",
  line2: "",
  state: "",
  postalCode: "",
};

export function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "").replace(/^00/, "+");
}

export function isPhoneValid(phone: string) {
  const digits = normalizePhone(phone.trim()).replace(/\D/g, "");
  return digits.length >= 9;
}

function looksLikePhoneLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed) return false;
  const digits = normalizePhone(trimmed).replace(/\D/g, "");
  return digits.length >= 9 && /^[+]?[\d\s\-().]+$/.test(trimmed);
}

export const US_STATES: { code: string; name: string }[] = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

export const CA_PROVINCES: { code: string; name: string }[] = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" },
];

type AddressLayout = {
  showState: boolean;
  stateOptions: { code: string; name: string }[] | null;
  postalStyle: "us" | "ca" | "uk" | "eu";
};

export function addressLayout(countryId: CountryId | string): AddressLayout {
  if (countryId === "tj") {
    return { showState: false, stateOptions: null, postalStyle: "eu" };
  }
  if (countryId === "us") {
    return { showState: true, stateOptions: US_STATES, postalStyle: "us" };
  }
  if (countryId === "ca") {
    return { showState: true, stateOptions: CA_PROVINCES, postalStyle: "ca" };
  }
  if (countryId === "gb" || countryId === "ie") {
    return { showState: false, stateOptions: null, postalStyle: "uk" };
  }
  if (countryId === "mx" || countryId === "br" || countryId === "ar" || countryId === "au") {
    return { showState: true, stateOptions: null, postalStyle: "eu" };
  }
  return { showState: false, stateOptions: null, postalStyle: "eu" };
}

export function isAddressValid(
  fields: AddressFields,
  countryId: CountryId | string,
  opts?: { requirePhone?: boolean }
) {
  return validateAddress(fields, countryId, opts).valid;
}

export type AddressValidationIssue = "phone" | "line1" | "state" | "postal" | "postalFormat";

export function validateAddress(
  fields: AddressFields,
  countryId: CountryId | string,
  opts?: { requirePhone?: boolean }
): { valid: true } | { valid: false; issue: AddressValidationIssue } {
  const requirePhone = opts?.requirePhone !== false;
  if (requirePhone && !isPhoneValid(fields.phone)) return { valid: false, issue: "phone" };
  const layout = addressLayout(countryId);
  if (!fields.line1.trim()) return { valid: false, issue: "line1" };
  if (layout.showState && !fields.state.trim()) return { valid: false, issue: "state" };
  const postal = fields.postalCode.trim();
  if (!postal) return { valid: false, issue: "postal" };
  if (layout.postalStyle === "us") {
    const normalized = postal.replace(/\s/g, "");
    if (!/^\d{5}(-\d{4})?$/.test(normalized)) {
      return { valid: false, issue: "postalFormat" };
    }
  }
  return { valid: true };
}

export function formatDeliveryAddress(
  fields: AddressFields,
  opts: { cityId: CityId | string; countryId: CountryId | string; lang: Lang }
) {
  const city = cityLabel(opts.cityId, opts.lang);
  const country = countryLabel(opts.countryId, opts.lang);
  const line1 = fields.line1.trim();
  const line2 = fields.line2.trim();
  const state = fields.state.trim();
  const postal = fields.postalCode.trim().toUpperCase();
  const layout = addressLayout(opts.countryId);

  const phone = fields.phone.trim();
  const lines: string[] = [];
  if (phone) lines.push(phone);
  lines.push(line1);
  if (line2) lines.push(line2);

  if (layout.postalStyle === "us") {
    lines.push(`${city}, ${state} ${postal}`);
  } else if (layout.postalStyle === "uk") {
    lines.push(city);
    lines.push(postal);
  } else if (layout.postalStyle === "ca") {
    lines.push(`${city}, ${state} ${postal}`);
  } else if (layout.showState && state) {
    lines.push(`${postal} ${city}, ${state}`);
  } else {
    lines.push(`${postal} ${city}`);
  }

  lines.push(country);
  return lines.filter(Boolean).join("\n");
}

/** Best-effort parse for legacy single-line addresses. */
export function parseDeliveryAddress(raw: string): AddressFields {
  const text = raw.trim();
  if (!text) return { ...EMPTY_ADDRESS };

  let lines = text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  let phone = "";
  if (lines[0] && looksLikePhoneLine(lines[0])) {
    phone = lines[0];
    lines = lines.slice(1);
  }

  if (!lines.length) {
    return { ...EMPTY_ADDRESS, phone };
  }

  if (lines.length === 1) {
    return { phone, line1: lines[0], line2: "", state: "", postalCode: "" };
  }

  const usTail = lines[lines.length - 1].match(/^(.+),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/);
  if (usTail && lines.length >= 2) {
    return {
      phone,
      line1: lines[0],
      line2: lines.length > 2 ? lines.slice(1, -1).join(", ") : "",
      state: usTail[2],
      postalCode: usTail[3],
    };
  }

  const postalOnly = lines[lines.length - 1].match(/^([A-Z0-9][A-Z0-9\s-]{2,10})$/i);
  if (postalOnly && lines.length >= 2) {
    return {
      phone,
      line1: lines[0],
      line2: lines.length > 2 ? lines[1] : "",
      state: "",
      postalCode: postalOnly[1],
    };
  }

  return {
    phone,
    line1: lines[0],
    line2: lines.slice(1).join(", "),
    state: "",
    postalCode: "",
  };
}

export function deliverToLabel(cityId: CityId | string, countryId: CountryId | string, lang: Lang) {
  return `${cityLabel(cityId, lang)}, ${countryLabel(countryId, lang)}`;
}
