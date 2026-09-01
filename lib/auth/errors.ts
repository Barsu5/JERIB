import { ApiError } from "@/lib/api/client";
import type { AddressValidationIssue } from "@/lib/address";
import type { DictKey } from "@/lib/i18n";

export type AuthErrorCode =
  | "exists"
  | "credentials"
  | "invalid"
  | "password"
  | "address"
  | "server";

export function mapAuthApiError(error: unknown): AuthErrorCode {
  if (error instanceof ApiError) {
    switch (error.body.error) {
      case "exists":
        return "exists";
      case "credentials":
        return "credentials";
      case "invalid":
        return "invalid";
      case "database_unavailable":
      case "server_error":
        return "server";
      default:
        return "server";
    }
  }
  return "server";
}

export function authErrorKey(code: AuthErrorCode): DictKey {
  switch (code) {
    case "exists":
      return "authEmailExists";
    case "credentials":
      return "authBadCredentials";
    case "password":
      return "authPasswordShort";
    case "address":
      return "authAddressInvalid";
    case "server":
      return "authServerError";
    default:
      return "authInvalid";
  }
}

export function addressIssueKey(issue: AddressValidationIssue): DictKey {
  switch (issue) {
    case "phone":
      return "authPhoneInvalid";
    case "line1":
      return "authAddressMissingStreet";
    case "state":
      return "authAddressMissingState";
    case "postal":
      return "authAddressMissingPostal";
    case "postalFormat":
      return "authAddressInvalidPostal";
    default:
      return "authAddressInvalid";
  }
}
