import api from "@/lib/services";

export type LicenseDomain = {
  id: string;
  domain: string;
  activatedAt: string;
};

export type LicenseItem = {
  id: string;
  licenseKey: string;
  status: "ACTIVE" | "EXPIRED" | "SUSPENDED";
  siteLimit: number;
  expiresAt: string | null;
  autoRenew: boolean;
  createdAt: string;
  plugin: { id: string; name: string; slug: string; iconUrl: string | null; version: string };
  plan: { id: string; name: string };
  domains: LicenseDomain[];
};

export const getMyLicensesService = async (): Promise<LicenseItem[]> => {
  const res = await api.get("/licenses/my");
  return res.data.data;
};

export const getDownloadUrlService = async (
  licenseKey: string,
): Promise<{ downloadUrl: string; filename: string }> => {
  const res = await api.get(`/licenses/${licenseKey}/download`);
  return res.data.data;
};

export const deactivateDomainService = async (
  licenseKey: string,
  domain: string,
): Promise<{ domain: string }> => {
  const res = await api.delete("/licenses/deactivate-domain", { data: { licenseKey, domain } });
  return res.data.data;
};
