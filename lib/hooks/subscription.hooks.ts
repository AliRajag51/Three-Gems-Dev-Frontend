"use client";

import { useQuery } from "@tanstack/react-query";
import { getMySubscriptionsService } from "@/lib/services/subscription.service";

export function useMySubscriptions(enabled = true) {
  return useQuery({
    queryKey: ["my-subscriptions"],
    queryFn: getMySubscriptionsService,
    enabled,
  });
}
