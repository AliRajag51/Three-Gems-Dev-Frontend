"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getContactMessagesService,
  updateContactMessageService,
  type ContactStatus,
} from "@/lib/services/contact.service";

export function useContactMessages(status?: ContactStatus) {
  return useQuery({
    queryKey: ["admin-contact", status ?? "all"],
    queryFn: () => getContactMessagesService(status),
  });
}

export function useUpdateContactMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContactStatus }) =>
      updateContactMessageService(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-contact"] }),
  });
}
