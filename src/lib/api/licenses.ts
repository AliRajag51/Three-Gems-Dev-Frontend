/**
 * Licenses API surface — customer dashboard endpoints.
 * Backend: src/modules/licenses/licenses.controller.ts.
 */
import { api } from "./client";
import type { LicensePublic, ListLicensesResponse, RenewLicenseResponse } from "./types";

export const licensesApi = {
  listLicenses(options: { limit?: number; cursor?: string } = {}) {
    return api.get<ListLicensesResponse>("/api/v1/me/licenses", { searchParams: options });
  },
  getLicense(id: string) {
    return api.get<LicensePublic>(`/api/v1/me/licenses/${encodeURIComponent(id)}`);
  },
  /** Creates a renewal Checkout Session for a ONE_TIME license; returns Stripe URL. */
  renewLicense(id: string) {
    return api.post<RenewLicenseResponse>(`/api/v1/me/licenses/${encodeURIComponent(id)}/renew`);
  },
  deactivateActivation(licenseId: string, activationId: string) {
    return api.post(
      `/api/v1/me/licenses/${encodeURIComponent(licenseId)}/activations/${encodeURIComponent(activationId)}/deactivate`,
    );
  },
};
