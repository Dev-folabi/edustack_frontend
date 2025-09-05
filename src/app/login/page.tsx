"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/authStore";
import { useToast } from "../../components/ui/Toast";
import { Loader, ButtonLoader } from "../../components/ui/Loader";
import Link from "next/link";
import { ApiError } from "../../utils/api";
import { authService } from "../../services/authService";

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login, checkOnboardingStatus } = useAuthStore();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const onboard = await checkOnboardingStatus();
        if (!onboard.isOnboarded) {
          router.push("/onboarding");
          return;
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      } finally {
        setIsCheckingOnboarding(false);
      }
    };

    checkSystemStatus();
  }, [checkOnboardingStatus, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.emailOrUsername || !formData.password) {
      showToast({
        title: "Validation Error",
        type: "error",
        message: "Please fill in all fields",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await login(formData.emailOrUsername, formData.password);
      showToast({
        title: "Login Successful",
        type: "success",
        message: "Welcome back!",
      });
      router.push("/admin/dashboard");
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
          message:
            "Your email is not verified. A new verification code has been sent to your email.",
        });
        // Resend OTP and redirect to verification page
        try {
          await authService.resendOTP({ email: formData.emailOrUsername });
          router.push(`/verify-email?userId=${userId}`);
        } catch (resendError) {
          console.error("Failed to resend OTP:", resendError);
        }
      } else {
        showToast({
          title: "Login Failed",
          type: "error",
          message: error instanceof Error ? error.message : "Invalid credentials",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingOnboarding) {
    return <Loader fullScreen text="Checking system status..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your EduStack account
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email or Username
              </label>
              <input
                type="text"
                name="emailOrUsername"
                value={formData.emailOrUsername}
                onChange={handleInputChange}
                className="input"
                placeholder="Enter your email or username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {/* Basic Show/Hide Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {showPassword ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242"
                      />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary disabled:opacity-50 flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <ButtonLoader />
                  <span className="ml-2">Signing In...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-sky-600 hover:text-sky-500"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
