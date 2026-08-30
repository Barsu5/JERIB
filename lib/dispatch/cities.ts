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

/** Map legacy city ids from older builds to Tajikistan cities. */
const LEGACY_CITY_MAP: Record<string, CityId> = {
  dushanbe: "tj_dushanbe",
  khujand: "tj_khujand",
  kulob: "tj_kulob",
  bokhtar: "tj_bokhtar",
  qurghonteppa: "tj_bokhtar",
  kurgan_tyube: "tj_bokhtar",
  istaravshan: "tj_istaravshan",
  vahdat: "tj_vahdat",
  gharm: "tj_rasht",
  chkalovsk: "tj_buston",
  kuybyshev: "tj_levakant",
  gafurov: "tj_gafurov",
};

export function normalizeCityId(id: string): CityId {
  if (LEGACY_CITY_MAP[id]) return LEGACY_CITY_MAP[id];
  if (CITIES.some((c) => c.id === id)) return id as CityId;
  return DEFAULT_CITY_ID;
}

export function countryById(id: CountryId | string) {
  return COUNTRIES.find((c) => c.id === id) ?? COUNTRIES[0];
}

export function countryLabel(id: CountryId | string, lang: Lang) {
  const c = countryById(id);
  if (lang === "ru") return c.nameRu;
  if (lang === "tg") return c.nameTg;
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

export function cityLabel(id: CityId | string, lang: Lang) {
  const c = cityById(id);
  if (lang === "ru") return c.nameRu;
  if (lang === "tg") return c.nameTg;
  return c.nameEn;
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
