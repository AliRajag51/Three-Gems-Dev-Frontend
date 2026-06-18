import api from "@/lib/services";

export type RegisterInitPayload = {
  name: string;
  email: string;
};

export type RegisterVerifyPayload = {
  otp: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export const registerInitService = async (data: RegisterInitPayload) => {
  const res = await api.post("/users/register-init", data);
  return res.data;
};

export const registerVerifyService = async (data: RegisterVerifyPayload) => {
  const res = await api.post("/users/register-verify", data);
  return res.data;
};

export const loginService = async (data: LoginPayload) => {
  const res = await api.post("/users/login", data);
  return res.data;
};

export const logoutService = async () => {
  const res = await api.post("/users/logout");
  return res.data;
};

export const getMeService = async () => {
  const res = await api.get("/users/me");
  return res.data;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  otp: string;
  newPassword: string;
};

export const forgotPasswordService = async (data: ForgotPasswordPayload) => {
  const res = await api.post("/users/forgot-password", data);
  return res.data;
};

export const resetPasswordService = async (data: ResetPasswordPayload) => {
  const res = await api.post("/users/reset-password", data);
  return res.data;
};
