import type { Lang } from "@/lib/i18n";
import {
  CITIES,
  COUNTRIES,
  DEFAULT_CITY_ID,
  DEFAULT_COUNTRY_ID,
  type City,
  type CityId,
  type Country,
  type CountryId,
} from "./geo-data";

export type { City, CityId, Country, CountryId };
export { CITIES, COUNTRIES, DEFAULT_CITY_ID, DEFAULT_COUNTRY_ID };

/** Legacy Tajikistan city ids from older builds → nearest market defaults. */
const LEGACY_CITY_MAP: Record<string, CityId> = {
  dushanbe: "us_new_york",
  khujand: "gb_london",
  kulob: "de_berlin",
};

export function normalizeCityId(id: string): CityId {
  if (LEGACY_CITY_MAP[id]) return LEGACY_CITY_MAP[id];
  if (CITIES.some((c) => c.id === id)) return id as CityId;
  return DEFAULT_CITY_ID;
}

export function countryById(id: CountryId | string) {
  return COUNTRIES.find((c) => c.id === id) ?? COUNTRIES[0];
}

export function countryLabel(id: CountryId | string, _lang: Lang) {
  const c = countryById(id);
  return c.nameEn;
}

export function citiesForCountry(countryId: CountryId | string) {
  return CITIES.filter((c) => c.countryId === countryId);
}

export function cityById(id: CityId | string) {
  const normalized = normalizeCityId(id);
  return CITIES.find((c) => c.id === normalized) ?? CITIES.find((c) => c.id === DEFAULT_CITY_ID)!;
}

export function cityCountryId(id: CityId | string): CountryId {
  return cityById(id).countryId as CountryId;
}

export function cityLabel(id: CityId | string, _lang: Lang) {
  return cityById(id).nameEn;
}

export function locationLabel(cityId: CityId | string, lang: Lang) {
  const city = cityById(cityId);
  return `${cityLabel(city.id, lang)}, ${countryLabel(city.countryId, lang)}`;
}

/** Haversine distance in km */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
