"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuthStore } from "../../store/authStore";
import { useToast } from "../../components/ui/Toast";
import { Loader } from "../../components/ui/Loader";
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
import { ApiError } from "../../utils/api";
import { authService } from "../../services/authService";
import { DASHBOARD_ROUTES } from "@/constants/routes";
import { COLORS } from "@/constants/colors";

const formSchema = z.object({
  emailOrUsername: z
    .string()
    .min(1, { message: "Email or Username is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof formSchema>;

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login, checkOnboardingStatus, isLoading } = useAuthStore();
  const { showToast } = useToast();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { emailOrUsername: "", password: "" },
  });

  // useEffect(() => {
  //   const checkSystemStatus = async () => {
  //     try {
  //       const onboard = await checkOnboardingStatus();
  //       if (!onboard.isOnboarded) {
  //         router.push("/onboarding");
  //         return;
  //       }
  //     } catch (error) {
  //       console.error("Error checking onboarding status:", error);
  //     } finally {
  //       setIsCheckingOnboarding(false);
  //     }
  //   };
  //   checkSystemStatus();
  // }, [checkOnboardingStatus, router]);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values.emailOrUsername, values.password);
      showToast({
        title: "Login Successful",
        type: "success",
        message: "Welcome back!",
      });

      // Get the latest state from the store to decide on redirection
      const authState = useAuthStore.getState();

      if (authState.user?.isSuperAdmin || authState.staff) {
        router.push(DASHBOARD_ROUTES.MULTI_SCHOOL_DASHBOARD);
      } else if (authState.student || authState.parent) {
        router.push(DASHBOARD_ROUTES.STUDENT_DASHBOARD);
      } else {
        // Fallback to the main dashboard
        router.push(DASHBOARD_ROUTES.MULTI_SCHOOL_DASHBOARD);
      }
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.message.includes("not verified") &&
        error.data?.userId
      ) {
        const { userId } = error.data;
        showToast({
          title: "Verification Required",
          type: "info",
          message: "A new verification code has been sent to your email.",
        });
        try {
          await authService.resendOTP(userId);
          router.push(`/verify-email?userId=${userId}`);
        } catch (resendError) {
          console.error("Failed to resend OTP:", resendError);
        }
      } else {
        showToast({
          title: "Login Failed",
          type: "error",
          message:
            error instanceof Error ? error.message : "Invalid credentials",
        });
      }
    }
  };

  // if (isCheckingOnboarding) {
  //   return <Loader fullScreen text="Checking system status..." />;
  // }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: COLORS.background.accent }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold" style={{ color: COLORS.primary[700] }}>
            Welcome Back
          </h2>
          <p className="mt-2 text-sm" style={{ color: COLORS.gray[600] }}>
            Sign in to your EduStack account
          </p>
        </div>

        <Card className="p-8" style={{ backgroundColor: COLORS.background.primary, borderColor: COLORS.gray[200] }}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="emailOrUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: COLORS.gray[700] }}>Email or Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="you@example.com" 
                        {...field} 
                        style={{ 
                          borderColor: COLORS.gray[300],
                          color: COLORS.gray[900]
                        }}
                        className="focus:ring-2 focus:border-transparent"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: COLORS.gray[700] }}>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          style={{ 
                            borderColor: COLORS.gray[300],
                            color: COLORS.gray[900]
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
              <Button 
                type="submit" 
                className="w-full font-medium transition-all duration-200 hover:shadow-lg" 
                disabled={isLoading}
                style={{ 
                  backgroundColor: COLORS.primary[500],
                  color: 'white'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = COLORS.primary[600];
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = COLORS.primary[500];
                  }
                }}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </Form>
        </Card>

        <p className="mt-4 text-center text-sm" style={{ color: COLORS.gray[600] }}>
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium transition-colors duration-200"
            style={{ color: COLORS.primary[600] }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = COLORS.primary[500];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = COLORS.primary[600];
            }}
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
