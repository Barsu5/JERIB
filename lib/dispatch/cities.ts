import type { City, CityId } from "./types";

export const CITIES: City[] = [
  {
    id: "dushanbe",
    nameEn: "Dushanbe",
    nameRu: "Душанбе",
    nameTg: "Душанбе",
    lat: 38.5598,
    lng: 68.774,
  },
  {
    id: "khujand",
    nameEn: "Khujand",
    nameRu: "Худжанд",
    nameTg: "Хуҷанд",
    lat: 40.2822,
    lng: 69.6222,
  },
  {
    id: "kulob",
    nameEn: "Kulob",
    nameRu: "Куляб",
    nameTg: "Кӯлоб",
    lat: 37.9144,
    lng: 69.7845,
  },
];

export function cityById(id: CityId) {
  return CITIES.find((c) => c.id === id) ?? CITIES[0];
}

export function cityLabel(id: CityId, lang: "en" | "ru" | "tg") {
  const c = cityById(id);
  if (lang === "ru") return c.nameRu;
  if (lang === "tg") return c.nameTg;
  return c.nameEn;
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
