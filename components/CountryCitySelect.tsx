"use client";

import { useEffect, useMemo, useState } from "react";
import {
  COUNTRIES,
  DEFAULT_CITY_ID,
  DEFAULT_COUNTRY_ID,
  citiesForCountry,
  cityCountryId,
  cityLabel,
  countryLabel,
  normalizeCityId,
  type CityId,
  type CountryId,
} from "@/lib/dispatch/cities";
import { useLang, useT } from "@/lib/i18n";

type Props = {
  countryId: CountryId;
  cityId: CityId;
  onCountryChange: (countryId: CountryId) => void;
  onCityChange: (cityId: CityId) => void;
  className?: string;
};

export function CountryCitySelect({
  countryId,
  cityId,
  onCountryChange,
  onCityChange,
  className = "",
}: Props) {
  const t = useT();
  const lang = useLang((s) => s.lang);
  const [localCountry, setLocalCountry] = useState<CountryId>(countryId || DEFAULT_COUNTRY_ID);

  useEffect(() => {
    setLocalCountry(countryId || cityCountryId(cityId));
  }, [countryId, cityId]);

  const cities = useMemo(() => citiesForCountry(localCountry), [localCountry]);

  const onCountry = (next: CountryId) => {
    setLocalCountry(next);
    onCountryChange(next);
    const first = citiesForCountry(next)[0];
    if (first) onCityChange(first.id);
  };

  return (
    <div className={`grid gap-4 sm:grid-cols-2 ${className}`}>
      <label className="block text-[10px] uppercase tracking-[0.22em] text-mist">
        {t("country")}
        <select
          value={localCountry}
          onChange={(e) => onCountry(e.target.value as CountryId)}
          className="mt-2 w-full border border-white/15 bg-ink px-3 py-3 text-sm text-paper outline-none focus:border-clay"
        >
          {COUNTRIES.map((c) => (
            <option key={c.id} value={c.id}>
              {countryLabel(c.id, lang)}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-[10px] uppercase tracking-[0.22em] text-mist">
        {t("city")}
        <select
          value={normalizeCityId(cityId)}
          onChange={(e) => onCityChange(e.target.value as CityId)}
          className="mt-2 w-full border border-white/15 bg-ink px-3 py-3 text-sm text-paper outline-none focus:border-clay"
        >
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {cityLabel(c.id, lang)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
