"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useToast } from "../../components/ui/Toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { authService } from "../../services/authService";
import { COLORS } from "@/constants/config";

const resetSchema = z
  .object({
    security_code: z
      .string()
      .min(6, { message: "OTP must be at least 6 characters." }),
    newPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetFormValues = z.infer<typeof resetSchema>;

interface ResetPasswordStepProps {
  onBack: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const ResetPasswordStep: React.FC<ResetPasswordStepProps> = ({
  onBack,
  isLoading,
  setIsLoading,
}) => {
  const router = useRouter();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      security_code: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  // Force clear form when component mounts
  useEffect(() => {
    form.setValue("security_code", "");
    form.setValue("newPassword", "");
    form.setValue("confirmPassword", "");
  }, [form]);

  const onSubmit = async (values: ResetFormValues) => {
    setIsLoading(true);
    try {
      await authService.resetPassword(values.security_code, values.newPassword);
      showToast({
        title: "Password Reset Successful",
        type: "success",
        message: "You can now login with your new password.",
      });
      router.push("/login");
    } catch (error) {
      showToast({
        title: "Reset Failed",
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to reset password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="security_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel style={{ color: COLORS.gray[700] }}>
                OTP Code
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  autoComplete="off"
                  autoFocus
                  name="otp-code"
                  id="otp-code-input"
                  style={{
                    borderColor: COLORS.gray[300],
                    color: COLORS.gray[900],
                  }}
                  className="focus:ring-2 focus:border-transparent"
                  onChange={(e) => {
                    // Only allow numbers
                    const value = e.target.value.replace(/\D/g, "");
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel style={{ color: COLORS.gray[700] }}>
                New Password
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    name="new-password-input"
                    id="new-password-input"
                    style={{
                      borderColor: COLORS.gray[300],
                      color: COLORS.gray[900],
                    }}
                    className="focus:ring-2 focus:border-transparent pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    style={{ color: COLORS.gray[500] }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel style={{ color: COLORS.gray[700] }}>
                Confirm Password
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    name="confirm-password-input"
                    id="confirm-password-input"
                    style={{
                      borderColor: COLORS.gray[300],
                      color: COLORS.gray[900],
                    }}
                    className="focus:ring-2 focus:border-transparent pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    style={{ color: COLORS.gray[500] }}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full font-medium transition-all duration-200 hover:shadow-lg"
          disabled={isLoading}
          style={{
            backgroundColor: COLORS.primary[500],
            color: "white",
          }}
        >
          {isLoading ? "Resetting..." : "Reset Password"}
        </Button>

        <button
          type="button"
          onClick={onBack}
          className="w-full text-sm font-medium transition-colors duration-200"
          style={{ color: COLORS.primary[600] }}
        >
          Resend OTP
        </button>
      </form>
    </Form>
  );
};

export default ResetPasswordStep;
