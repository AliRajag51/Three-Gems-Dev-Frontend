"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyLicensesService, deactivateDomainService } from "@/lib/services/license.service";

export function useMyLicenses(enabled = true) {
  return useQuery({
    queryKey: ["my-licenses"],
    queryFn: getMyLicensesService,
    enabled,
  });
}

export function useDeactivateDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ licenseKey, domain }: { licenseKey: string; domain: string }) =>
      deactivateDomainService(licenseKey, domain),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-licenses"] }),
  });
}
