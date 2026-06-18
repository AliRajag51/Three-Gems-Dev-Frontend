"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/hooks/use-toast";
import {
  registerInitService,
  registerVerifyService,
  loginService,
  logoutService,
  getMeService,
  forgotPasswordService,
  resetPasswordService,
  type RegisterInitPayload,
  type RegisterVerifyPayload,
  type LoginPayload,
  type ForgotPasswordPayload,
  type ResetPasswordPayload,
} from "@/lib/services/auth.service";

export function useRegisterInit() {
  return useMutation({
    mutationFn: (data: RegisterInitPayload) => registerInitService(data),
    onSuccess: (res) => {
      toast({ title: res?.message ?? "OTP sent to your email" });
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: err?.response?.data?.message ?? "Failed to send OTP. Try again.",
      });
    },
  });
}

export function useRegisterVerify() {
  return useMutation({
    mutationFn: (data: RegisterVerifyPayload) => registerVerifyService(data),
    onSuccess: (res) => {
      toast({ title: res?.message ?? "Account created successfully!" });
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: err?.response?.data?.message ?? "Registration failed. Please try again.",
      });
    },
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginPayload) => loginService(data),
    onSuccess: (res) => {
      toast({ title: res?.message ?? "Logged in successfully!" });
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: err?.response?.data?.message ?? "Login failed. Please try again.",
      });
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: logoutService,
    onSuccess: (res) => {
      toast({ title: res?.message ?? "Logged out successfully." });
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: err?.response?.data?.message ?? "Logout failed.",
      });
    },
  });
}

export function useVerifyAuth() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.fetchQuery({
      queryKey: ["me"],
      queryFn: getMeService,
      staleTime: 0,
    });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordPayload) => forgotPasswordService(data),
    onSuccess: (res) => {
      toast({ title: res?.message ?? "OTP sent to your email" });
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: err?.response?.data?.message ?? "Failed to send OTP. Try again.",
      });
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordPayload) => resetPasswordService(data),
    onSuccess: (res) => {
      toast({ title: res?.message ?? "Password reset successfully" });
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: err?.response?.data?.message ?? "Password reset failed.",
      });
    },
  });
}
