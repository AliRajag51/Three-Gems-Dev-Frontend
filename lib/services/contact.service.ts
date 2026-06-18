import api from "@/lib/services";

export type ContactSubject = "SALES" | "AGENCY" | "PARTNERSHIP" | "OTHER";
export type ContactStatus = "NEW" | "READ" | "REPLIED";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  subject: ContactSubject;
  message: string;
  status: ContactStatus;
  createdAt: string;
};

export const createContactService = async (payload: {
  name: string;
  email: string;
  company?: string;
  subject: ContactSubject;
  message: string;
  website?: string; // honeypot — must stay empty
}): Promise<{ id: string | null }> => {
  const res = await api.post("/contact", payload);
  return res.data.data;
};

export const getContactMessagesService = async (
  status?: ContactStatus,
): Promise<{ messages: ContactMessage[]; newCount: number }> => {
  const res = await api.get("/admin/contact", { params: status ? { status } : {} });
  return res.data.data;
};

export const updateContactMessageService = async (
  id: string,
  status: ContactStatus,
): Promise<ContactMessage> => {
  const res = await api.patch(`/admin/contact/${id}`, { status });
  return res.data.data;
};
