import api from "@/lib/services";

export type SupportTicketType = "PAYMENT" | "PLUGIN" | "LICENSE" | "ACCOUNT" | "OTHER";
export type SupportTicketStatus = "OPEN" | "RESOLVED";

export type SupportTicket = {
  id: string;
  email: string;
  licenseKey: string | null;
  type: SupportTicketType;
  message: string;
  status: SupportTicketStatus;
  createdAt: string;
  user: { name: string; email: string } | null;
};

export const createSupportTicketService = async (payload: {
  email: string;
  licenseKey?: string;
  type: SupportTicketType;
  message: string;
}): Promise<{ id: string }> => {
  const res = await api.post("/support", payload);
  return res.data.data;
};

export const getSupportTicketsService = async (
  status?: SupportTicketStatus,
): Promise<{ tickets: SupportTicket[]; openCount: number }> => {
  const res = await api.get("/admin/support", { params: status ? { status } : {} });
  return res.data.data;
};

export const updateSupportTicketService = async (
  id: string,
  status: SupportTicketStatus,
): Promise<SupportTicket> => {
  const res = await api.patch(`/admin/support/${id}`, { status });
  return res.data.data;
};
