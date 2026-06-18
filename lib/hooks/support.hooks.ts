"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSupportTicketsService,
  updateSupportTicketService,
  type SupportTicketStatus,
} from "@/lib/services/support.service";

export function useSupportTickets(status?: SupportTicketStatus) {
  return useQuery({
    queryKey: ["admin-support", status ?? "all"],
    queryFn: () => getSupportTicketsService(status),
  });
}

export function useUpdateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: SupportTicketStatus }) =>
      updateSupportTicketService(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-support"] }),
  });
}
