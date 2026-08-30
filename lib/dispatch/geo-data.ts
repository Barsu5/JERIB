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

/** Official cities and major district centers of Tajikistan. */
const RAW: RawCountry[] = [
  [
    "tj",
    "Tajikistan",
    "Таджикистан",
    "central_asia",
    [
      // Dushanbe & districts of republican subordination
      ["dushanbe", "Dushanbe", "Душанбе", "Душанбе", 38.5598, 68.7738],
      ["tursunzoda", "Tursunzoda", "Турсунзода", "Турсунзода", 38.5139, 68.2311],
      ["hisor", "Hisor", "Гиссар", "Ҳисор", 38.5247, 68.5486],
      ["vahdat", "Vahdat", "Вахдат", "Ваҳдат", 38.5563, 69.0135],
      ["rogun", "Rogun", "Рогун", "Роғун", 38.7728, 69.8753],
      ["faizobod", "Faizobod", "Файзобод", "Файзобод", 38.6861, 69.3831],
      ["obigarm", "Obigarm", "Обигарм", "Обигарм", 38.7139, 69.7178],
      ["shahrinav", "Shahrinav", "Шахринав", "Шаҳринав", 38.5811, 68.3317],
      ["varzob", "Varzob", "Варзоб", "Варзоб", 38.7753, 68.8189],
      ["rasht", "Rasht", "Рашт", "Рашт", 39.0217, 70.3744],
      ["jirgatol", "Jirgatol", "Джиргаталь", "Ҷиргатол", 39.1833, 70.0667],
      ["tavildara", "Tavildara", "Тавильдара", "Тавилдара", 38.8928, 70.8681],
      // Sughd region
      ["khujand", "Khujand", "Худжанд", "Хуҷанд", 40.2826, 69.6222],
      ["istaravshan", "Istaravshan", "Истаравшан", "Истаравшан", 39.9142, 69.0963],
      ["konibodom", "Konibodom", "Конибодом", "Конибодом", 37.997, 68.8103],
      ["isfara", "Isfara", "Исфара", "Исфара", 40.1264, 70.6253],
      ["panjakent", "Panjakent", "Пенджикент", "Панҷакент", 39.495, 67.6093],
      ["buston", "Buston", "Бустон", "Бустон", 40.2269, 69.7283],
      ["gafurov", "Gafurov", "Гафуров", "Ғафуров", 40.2869, 69.7331],
      ["taboshar", "Taboshar", "Табошар", "Табошар", 40.5703, 69.6428],
      ["zafarobod", "Zafarobod", "Зафаробод", "Зафаробод", 40.1586, 69.0144],
      ["proletarsk", "Proletarsk", "Пролетарск", "Пролетарск", 40.1639, 69.5067],
      ["nov", "Nov", "Нов", "Нов", 40.0422, 69.3628],
      ["matcha", "Matcha", "Матча", "Матча", 39.9236, 69.3239],
      ["asht", "Asht", "Ашт", "Ашт", 40.6333, 70.3667],
      // Khatlon region
      ["bokhtar", "Bokhtar", "Бохтар", "Бохтар", 37.8364, 68.7803],
      ["kulob", "Kulob", "Куляб", "Кӯлоб", 37.9144, 69.7845],
      ["danghara", "Danghara", "Данғара", "Дангара", 38.0958, 69.335],
      ["yovon", "Yovon", "Ёвон", "Ёвон", 38.3136, 69.0378],
      ["vose", "Vose", "Восеъ", "Восеъ", 37.8867, 69.6417],
      ["farkhor", "Farkhor", "Фархор", "Фархор", 37.4972, 69.4036],
      ["nurek", "Nurek", "Нурек", "Норак", 38.3897, 69.3228],
      ["norak", "Norak", "Норак", "Норак", 38.3908, 69.2139],
      ["shahrituz", "Shahrituz", "Шахритуз", "Шаҳритус", 37.2622, 68.1378],
      ["sarband", "Sarband", "Сарбанд", "Сарбанд", 37.8731, 68.9125],
      ["moskovskiy", "Moskovskiy", "Московский", "Московский", 37.6092, 68.5806],
      ["kolkhozobod", "Kolkhozobod", "Колхозабад", "Колхозобад", 37.5883, 68.6589],
      ["dusti", "Dusti", "Дусти", "Дустӣ", 37.3481, 68.6639],
      ["levakant", "Levakant", "Левакант", "Левакант", 37.8167, 68.9333],
      ["baljuvon", "Baljuvon", "Балджуван", "Балҷувон", 38.3056, 69.0731],
      ["khovaling", "Khovaling", "Ховалинг", "Ховалинг", 38.3408, 69.9847],
      ["temurmalik", "Temurmalik", "Темурмалик", "Темурмалик", 37.9667, 69.4833],
      ["jomi", "Jomi", "Джоми", "Ҷомӣ", 38.0333, 68.6167],
      ["vakhsh", "Vakhsh", "Вахш", "Вахш", 37.7089, 68.8306],
      ["pyanj", "Pyanj", "Пяндж", "Панҷ", 37.2367, 69.0986],
      // Gorno-Badakhshan (GBAO)
      ["khorog", "Khorog", "Хорог", "Хоруғ", 37.4923, 71.557],
      ["murghob", "Murghob", "Мургаб", "Мурғоб", 38.1703, 73.9667],
      ["ishkoshim", "Ishkoshim", "Ишкашим", "Ишкошим", 36.7278, 71.6119],
      ["vanch", "Vanch", "Ванч", "Ванҷ", 38.38, 71.4533],
      ["rushon", "Rushon", "Рушан", "Рӯшон", 37.8833, 71.55],
    ],
  ],
];

function buildGeo() {
  const countries: Country[] = [];
  const cities: City[] = [];
  for (const [countryId, nameEn, nameRu, region, cityList] of RAW) {
    countries.push({
      id: countryId,
      nameEn,
      nameRu,
      nameTg: countryId === "tj" ? "Тоҷикистон" : nameEn,
      region,
    });
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
