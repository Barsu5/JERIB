import type { CityId } from "@/lib/dispatch/types";

export type UserRole = "client" | "partner" | "admin";

/** How the account was created / last signed in */
export type AuthProvider = "email" | "google" | "apple" | "telegram" | "phone";

export type OAuthProvider = "google" | "apple" | "telegram";

export type AuthUser = {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  cityId: CityId;
  address: string;
  /** Linked production partner profile (partner role) */
  partnerId: string | null;
  provider: AuthProvider;
  /** Stable id from OAuth / normalized phone */
  providerId: string | null;
  createdAt: number;
};

export type PublicUser = Omit<AuthUser, "passwordHash">;

export type GoogleProfileInput = {
  sub: string;
  email: string;
  name: string;
  picture?: string;
};

export type RegisterClientInput = {
  name: string;
  email: string;
  phone: string;
  password: string;
  cityId: CityId;
  address?: string;
};

export type RegisterPartnerInput = {
  name: string;
  email: string;
  phone: string;
  password: string;
  cityId: CityId;
  companyName: string;
  address: string;
};
