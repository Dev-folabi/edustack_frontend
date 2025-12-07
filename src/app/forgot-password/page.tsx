"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
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
import { Card } from "@/components/ui/card";
import { authService } from "../../services/authService";
import { COLORS, SCHOOL_INFO } from "@/constants/config";

// Schema for Step 1: Request Reset
const requestSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

// Schema for Step 2: Reset Password
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

type RequestFormValues = z.infer<typeof requestSchema>;
type ResetFormValues = z.infer<typeof resetSchema>;

const ForgotPasswordPage: React.FC = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");

  const requestForm = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { security_code: "", newPassword: "", confirmPassword: "" },
  });

  const onRequestSubmit = async (values: RequestFormValues) => {
    setIsLoading(true);
    try {
      await authService.requestPasswordReset(values.email);
      setEmail(values.email);
      setStep(2);
      showToast({
        title: "OTP Sent",
        type: "success",
        message: "If an account exists, an OTP has been sent to your email.",
      });
    } catch (error) {
      showToast({
        title: "Request Failed",
        type: "error",
        message: error instanceof Error ? error.message : "Failed to send OTP",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onResetSubmit = async (values: ResetFormValues) => {
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
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: COLORS.background.accent }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2
            className="text-3xl font-extrabold"
            style={{ color: COLORS.primary[700] }}
          >
            Reset Password
          </h2>
          <p className="mt-2 text-sm" style={{ color: COLORS.gray[600] }}>
            {step === 1
              ? `Enter your email to reset your ${SCHOOL_INFO.name} password`
              : `Enter the OTP sent to ${email}`}
          </p>
        </div>

        <Card
          className="p-8"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.gray[200],
          }}
        >
          {step === 1 ? (
            <Form {...requestForm}>
              <form
                onSubmit={requestForm.handleSubmit(onRequestSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={requestForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: COLORS.gray[700] }}>
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          autoComplete="email"
                          placeholder="you@example.com"
                          {...field}
                          style={{
                            borderColor: COLORS.gray[300],
                            color: COLORS.gray[900],
                          }}
                          className="focus:ring-2 focus:border-transparent"
                        />
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
                  {isLoading ? "Sending OTP..." : "Send Reset Code"}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...resetForm}>
              <form
                onSubmit={resetForm.handleSubmit(onResetSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={resetForm.control}
                  name="security_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: COLORS.gray[700] }}>
                        OTP Code
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="123456"
                          {...field}
                          style={{
                            borderColor: COLORS.gray[300],
                            color: COLORS.gray[900],
                          }}
                          className="focus:ring-2 focus:border-transparent"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={resetForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: COLORS.gray[700] }}>
                        New Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="••••••••"
                            {...field}
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
                  control={resetForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: COLORS.gray[700] }}>
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="••••••••"
                            {...field}
                            style={{
                              borderColor: COLORS.gray[300],
                              color: COLORS.gray[900],
                            }}
                            className="focus:ring-2 focus:border-transparent pr-10"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
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
              </form>
            </Form>
          )}
        </Card>

        <div className="mt-4 text-center">
          <Link
            href="/login"
            className="inline-flex items-center text-sm font-medium transition-colors duration-200"
            style={{ color: COLORS.primary[600] }}
          >
            <FaArrowLeft className="mr-2" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
