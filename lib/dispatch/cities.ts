export type City = {
  id: string;
  nameEn: string;
  nameRu: string;
  nameTg: string;
  lat: number;
  lng: number;
};

/** All cities and major towns of Tajikistan (administrative centers). */
export const CITIES = [
  // Dushanbe
  { id: "dushanbe", nameEn: "Dushanbe", nameRu: "Душанбе", nameTg: "Душанбе", lat: 38.5598, lng: 68.774 },

  // Districts of Republican Subordination
  { id: "vahdat", nameEn: "Vahdat", nameRu: "Вахдат", nameTg: "Ваҳдат", lat: 38.5563, lng: 69.0135 },
  { id: "hisor", nameEn: "Hisor", nameRu: "Гиссар", nameTg: "Ҳисор", lat: 38.525, lng: 68.5486 },
  { id: "tursunzoda", nameEn: "Tursunzoda", nameRu: "Турсунзаде", nameTg: "Турсунзода", lat: 38.5125, lng: 68.2314 },
  { id: "rogun", nameEn: "Rogun", nameRu: "Рогун", nameTg: "Роғун", lat: 38.5958, lng: 69.9689 },
  { id: "nurek", nameEn: "Nurek", nameRu: "Нурек", nameTg: "Нурек", lat: 38.3867, lng: 69.3244 },
  { id: "shahrinav", nameEn: "Shahrinav", nameRu: "Шахринав", nameTg: "Шаҳринав", lat: 38.5667, lng: 68.3333 },
  { id: "rudaki", nameEn: "Rudaki", nameRu: "Рудаки", nameTg: "Рӯдакӣ", lat: 38.5833, lng: 68.7833 },
  { id: "faizobod", nameEn: "Faizobod", nameRu: "Файзабад", nameTg: "Файзобод", lat: 38.7, lng: 70.5167 },
  { id: "gharm", nameEn: "Gharm", nameRu: "Гарм", nameTg: "Ғарм", lat: 38.9833, lng: 69.3167 },
  { id: "rasht", nameEn: "Rasht", nameRu: "Рашт", nameTg: "Рашт", lat: 39.0333, lng: 70.3667 },
  { id: "tojikobod", nameEn: "Tojikobod", nameRu: "Таджикабад", nameTg: "Тоҷикобод", lat: 39.0333, lng: 71.8333 },
  { id: "lakhsh", nameEn: "Lakhsh", nameRu: "Лахш", nameTg: "Лахш", lat: 39.1667, lng: 71.7833 },

  // Sughd Oblast
  { id: "khujand", nameEn: "Khujand", nameRu: "Худжанд", nameTg: "Хуҷанд", lat: 40.2822, lng: 69.6222 },
  { id: "istaravshan", nameEn: "Istaravshan", nameRu: "Истаравшан", nameTg: "Истаравшан", lat: 39.9142, lng: 69.0079 },
  { id: "konibodom", nameEn: "Konibodom", nameRu: "Канибадам", nameTg: "Конибодом", lat: 40.2922, lng: 70.4167 },
  { id: "isfara", nameEn: "Isfara", nameRu: "Исфара", nameTg: "Исфара", lat: 40.1264, lng: 70.6253 },
  { id: "panjakent", nameEn: "Panjakent", nameRu: "Пенджикент", nameTg: "Панҷакент", lat: 39.4953, lng: 67.6093 },
  { id: "buston", nameEn: "Buston", nameRu: "Бустон", nameTg: "Бустон", lat: 40.2167, lng: 69.7333 },
  { id: "gafurov", nameEn: "Gafurov", nameRu: "Гафуров", nameTg: "Ғафуров", lat: 40.2167, lng: 69.7 },
  { id: "zafarobod", nameEn: "Zafarobod", nameRu: "Зафаробод", nameTg: "Зафаробод", lat: 40.1667, lng: 69.0 },
  { id: "istiqlol", nameEn: "Istiqlol", nameRu: "Истиклол", nameTg: "Истиқлол", lat: 40.5833, lng: 69.6833 },
  { id: "ayni", nameEn: "Ayni", nameRu: "Айни", nameTg: "Айнӣ", lat: 39.4, lng: 68.5333 },
  { id: "asht", nameEn: "Asht", nameRu: "Ашт", nameTg: "Ошт", lat: 40.6667, lng: 70.35 },
  { id: "spitamen", nameEn: "Spitamen", nameRu: "Спитамен", nameTg: "Спитамен", lat: 40.2833, lng: 69.3667 },
  { id: "mastchoh", nameEn: "Mastchoh", nameRu: "Мастчох", nameTg: "Мастчоҳ", lat: 39.3667, lng: 68.1 },
  { id: "shahriston", nameEn: "Shahriston", nameRu: "Шахристон", nameTg: "Шаҳристон", lat: 39.75, lng: 68.75 },
  { id: "guliston", nameEn: "Guliston", nameRu: "Гулистон", nameTg: "Гулистон", lat: 40.4833, lng: 69.0333 },

  // Khatlon Oblast
  { id: "bokhtar", nameEn: "Bokhtar", nameRu: "Бохтар", nameTg: "Бохтар", lat: 37.8383, lng: 68.7817 },
  { id: "kulob", nameEn: "Kulob", nameRu: "Куляб", nameTg: "Кӯлоб", lat: 37.9144, lng: 69.7845 },
  { id: "norak", nameEn: "Norak", nameRu: "Нурак", nameTg: "Норак", lat: 37.8361, lng: 69.6133 },
  { id: "yovon", nameEn: "Yovon", nameRu: "Ёвон", nameTg: "Ёвон", lat: 37.9833, lng: 69.0333 },
  { id: "vose", nameEn: "Vose", nameRu: "Восе", nameTg: "Восеъ", lat: 37.9639, lng: 69.6431 },
  { id: "danghara", nameEn: "Danghara", nameRu: "Дангара", nameTg: "Данғара", lat: 38.0958, lng: 69.3358 },
  { id: "farkhor", nameEn: "Farkhor", nameRu: "Фархор", nameTg: "Фархор", lat: 37.5014, lng: 69.4036 },
  { id: "shaartuz", nameEn: "Shaartuz", nameRu: "Шаартуз", nameTg: "Шаҳритус", lat: 37.2667, lng: 68.1333 },
  { id: "jilikul", nameEn: "Jilikul", nameRu: "Джиликуль", nameTg: "Ҷиликӯл", lat: 37.4833, lng: 68.5333 },
  { id: "sarband", nameEn: "Sarband", nameRu: "Сарбанд", nameTg: "Сарбанд", lat: 37.8833, lng: 68.9167 },
  { id: "kolkhozobod", nameEn: "Kolkhozobod", nameRu: "Колхозабад", nameTg: "Колхозабод", lat: 37.5833, lng: 68.0667 },
  { id: "dusti", nameEn: "Dusti", nameRu: "Дусти", nameTg: "Дустӣ", lat: 37.3481, lng: 68.6569 },
  { id: "levakant", nameEn: "Levakant", nameRu: "Левакант", nameTg: "Левакант", lat: 37.8667, lng: 68.95 },
  { id: "muminobod", nameEn: "Muminobod", nameRu: "Муминабад", nameTg: "Муминобод", lat: 38.1167, lng: 70.0333 },
  { id: "khovaling", nameEn: "Khovaling", nameRu: "Ховалинг", nameTg: "Ховалинг", lat: 38.3167, lng: 69.6833 },
  { id: "baljuvon", nameEn: "Baljuvon", nameRu: "Балджуван", nameTg: "Балҷувон", lat: 38.2833, lng: 69.6667 },
  { id: "temurmalik", nameEn: "Temurmalik", nameRu: "Темурмалик", nameTg: "Темурмалик", lat: 37.85, lng: 69.8833 },
  { id: "khuroson", nameEn: "Khuroson", nameRu: "Хуросон", nameTg: "Хуросон", lat: 37.5167, lng: 68.8167 },
  { id: "qubodiyon", nameEn: "Qubodiyon", nameRu: "Кубодиён", nameTg: "Қубодиён", lat: 37.1167, lng: 68.1667 },
  { id: "vakhsh", nameEn: "Vakhsh", nameRu: "Вахш", nameTg: "Вахш", lat: 37.7167, lng: 69.6333 },
  { id: "moskovskiy", nameEn: "Moskovskiy", nameRu: "Московский", nameTg: "Московский", lat: 37.6167, lng: 68.8833 },

  // GBAO
  { id: "khorugh", nameEn: "Khorugh", nameRu: "Хорог", nameTg: "Хоруғ", lat: 37.4917, lng: 71.5583 },
  { id: "murghob", nameEn: "Murghob", nameRu: "Мургаб", nameTg: "Мурғоб", lat: 38.17, lng: 73.97 },
  { id: "ishkashim", nameEn: "Ishkashim", nameRu: "Ишкашим", nameTg: "Ишкошим", lat: 37.2333, lng: 71.2667 },
  { id: "vanj", nameEn: "Vanj", nameRu: "Ванж", nameTg: "Ванҷ", lat: 38.3833, lng: 73.25 },
  { id: "darvoz", nameEn: "Darvoz", nameRu: "Дарвоз", nameTg: "Дарвоз", lat: 38.4667, lng: 70.7833 },
  { id: "rushan", nameEn: "Rushan", nameRu: "Рушан", nameTg: "Рӯшон", lat: 38.1167, lng: 72.2167 },
] as const satisfies readonly City[];

export type CityId = (typeof CITIES)[number]["id"];

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
