"use client";

import {
  addressLayout,
  deliverToLabel,
  type AddressFields,
} from "@/lib/address";
import type { CityId, CountryId } from "@/lib/dispatch/cities";
import { useLang, useT } from "@/lib/i18n";

const fieldClass =
  "mt-2 w-full border border-white/15 bg-transparent px-3 py-3 text-sm text-paper outline-none focus:border-clay";
const selectClass =
  "mt-2 w-full border border-white/15 bg-ink px-3 py-3 text-sm text-paper outline-none focus:border-clay";

type Props = {
  countryId: CountryId;
  cityId: CityId;
  value: AddressFields;
  onChange: (value: AddressFields) => void;
  required?: boolean;
  /** delivery = client shipping; company = partner workshop / business */
  variant?: "delivery" | "company";
};

export function AddressForm({
  countryId,
  cityId,
  value,
  onChange,
  required = true,
  variant = "delivery",
}: Props) {
  const t = useT();
  const lang = useLang((s) => s.lang);
  const layout = addressLayout(countryId);
  const isCompany = variant === "company";

  const set = (patch: Partial<AddressFields>) => onChange({ ...value, ...patch });

  const postalLabel =
    layout.postalStyle === "us"
      ? t("zipCode")
      : layout.postalStyle === "uk"
        ? t("postcode")
        : t("postalCode");

  const postalPlaceholder =
    layout.postalStyle === "us"
      ? "10001"
      : layout.postalStyle === "ca"
        ? "M5H 2N2"
        : layout.postalStyle === "uk"
          ? "SW1A 1AA"
          : "10115";

  const locationHint = isCompany
    ? t("companyLocatedIn")
    : t("deliverTo");

  return (
    <fieldset className="space-y-4">
      <legend className="text-[10px] uppercase tracking-[0.22em] text-mist">
        {isCompany ? t("companyAddress") : t("address")}
      </legend>
      <p className="text-xs text-mist">
        {locationHint}: {deliverToLabel(cityId, countryId, lang)}
      </p>

      <label className="block text-[10px] uppercase tracking-[0.22em] text-mist">
        {t("addressLine1")}
        <input
          required={required}
          value={value.line1}
          onChange={(e) => set({ line1: e.target.value })}
          placeholder={t("addressLine1Placeholder")}
          autoComplete={isCompany ? "organization" : "address-line1"}
          className={fieldClass}
        />
      </label>

      <label className="block text-[10px] uppercase tracking-[0.22em] text-mist">
        {t("addressLine2")}
        <input
          value={value.line2}
          onChange={(e) => set({ line2: e.target.value })}
          placeholder={t("addressLine2Placeholder")}
          autoComplete="address-line2"
          className={fieldClass}
        />
      </label>

      <div className={`grid gap-4 ${layout.showState ? "sm:grid-cols-2" : ""}`}>
        {layout.showState && (
          <label className="block text-[10px] uppercase tracking-[0.22em] text-mist">
            {countryId === "ca" ? t("province") : t("state")}
            {layout.stateOptions ? (
              <select
                required={required}
                value={value.state}
                onChange={(e) => set({ state: e.target.value })}
                autoComplete="address-level1"
                className={selectClass}
              >
                <option value="">{t("selectState")}</option>
                {layout.stateOptions.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                required={required}
                value={value.state}
                onChange={(e) => set({ state: e.target.value })}
                placeholder={t("stateProvincePlaceholder")}
                autoComplete="address-level1"
                className={fieldClass}
              />
            )}
          </label>
        )}

        <label className="block text-[10px] uppercase tracking-[0.22em] text-mist">
          {postalLabel}
          <input
            required={required}
            value={value.postalCode}
            onChange={(e) => set({ postalCode: e.target.value })}
            placeholder={postalPlaceholder}
            autoComplete="postal-code"
            inputMode={layout.postalStyle === "us" ? "numeric" : "text"}
            className={fieldClass}
          />
        </label>
      </div>
    </fieldset>
  );
}
