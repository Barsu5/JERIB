/** Tajikistan — countries and cities (launch market). */

export type Region = "central_asia";

export type Country = {
  id: string;
  nameEn: string;
  nameRu: string;
  nameTg: string;
  region: Region;
};

export type City = {
  id: string;
  countryId: string;
  nameEn: string;
  nameRu: string;
  nameTg: string;
  lat: number;
  lng: number;
};

type RawCity = readonly [slug: string, en: string, ru: string, tg: string, lat: number, lng: number];
type RawCountry = readonly [id: string, en: string, ru: string, region: Region, cities: readonly RawCity[]];

const RAW: RawCountry[] = [
  [
    "tj",
    "Tajikistan",
    "Таджикистан",
    "central_asia",
    [
      ["dushanbe", "Dushanbe", "Душанбе", "Душанбе", 38.5598, 68.7738],
      ["khujand", "Khujand", "Худжанд", "Хуҷанд", 40.2826, 69.6222],
      ["kulob", "Kulob", "Куляб", "Кӯлоб", 37.9144, 69.7845],
      ["bokhtar", "Bokhtar", "Бохтар", "Бохтар", 37.8364, 68.7803],
      ["istaravshan", "Istaravshan", "Истаравшан", "Истаравшан", 39.9142, 69.0963],
      ["vahdat", "Vahdat", "Вахдат", "Ваҳдат", 38.5563, 69.0135],
    ],
  ],
];

function buildGeo() {
  const countries: Country[] = [];
  const cities: City[] = [];
  for (const [countryId, nameEn, nameRu, region, cityList] of RAW) {
    countries.push({ id: countryId, nameEn, nameRu, nameTg: nameEn, region });
    for (const [slug, cityEn, cityRu, cityTg, lat, lng] of cityList) {
      cities.push({
        id: `${countryId}_${slug}`,
        countryId,
        nameEn: cityEn,
        nameRu: cityRu,
        nameTg: cityTg,
        lat,
        lng,
      });
    }
  }
  return { countries, cities };
}

const built = buildGeo();
export const COUNTRIES = built.countries;
export const CITIES = built.cities;
export const DEFAULT_COUNTRY_ID = "tj";
export const DEFAULT_CITY_ID = "tj_dushanbe";

export type CountryId = (typeof COUNTRIES)[number]["id"];
export type CityId = (typeof CITIES)[number]["id"];
