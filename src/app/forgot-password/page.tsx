"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { Card } from "@/components/ui/card";
import { COLORS, SCHOOL_INFO } from "@/constants/config";
import RequestOTPStep from "@/components/auth/RequestOTPStep";
import ResetPasswordStep from "@/components/auth/ResetPasswordStep";

const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleOTPSuccess = (userEmail: string) => {
    setEmail(userEmail);
    setStep(2);
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setEmail("");
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
            <RequestOTPStep
              onSuccess={handleOTPSuccess}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          ) : (
            <ResetPasswordStep
              onBack={handleBackToStep1}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
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
