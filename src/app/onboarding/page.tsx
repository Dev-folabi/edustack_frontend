"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import { Loader, ButtonLoader } from "@/components/ui/Loader";
import { useAuthStore } from "@/store/authStore";
import type { OnboardingData } from "@/services/authService";

export default function OnboardingPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    adminName: "",
    adminEmail: "",
    adminUsername: "",
    adminPassword: "",
    schoolName: "",
    schoolAddress: "",
    schoolPhone: [""],
    schoolEmail: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const { showToast } = useToast();
  const { checkOnboardingStatus, initializeSystem } = useAuthStore();

  const steps = ["Admin Account", "School Information"];

  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const status = await checkOnboardingStatus();
        if (status.isOnboarded) {
          router.push("/login");
          return;
        }
      } catch (error) {
        console.error("Failed to check system status:", error);
      } finally {
        setLoading(false);
      }
    };
    checkSystemStatus();
  }, [checkOnboardingStatus, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("schoolPhone")) {
      const index = parseInt(name.split("-")[1] || "0");
      setFormData((prev) => ({
        ...prev,
        schoolPhone: prev.schoolPhone.map((phone, i) =>
          i === index ? value : phone
        ),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const addPhoneNumber = () => {
    setFormData((prev) => ({
      ...prev,
      schoolPhone: [...prev.schoolPhone, ""],
    }));
  };

  const removePhoneNumber = (index: number) => {
    if (formData.schoolPhone.length > 1) {
      setFormData((prev) => ({
        ...prev,
        schoolPhone: prev.schoolPhone.filter((_, i) => i !== index),
      }));
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 0) {
      if (!formData.adminName.trim()) newErrors.adminName = "Name is required";
      if (!formData.adminEmail.trim())
        newErrors.adminEmail = "Email is required";
      if (!formData.adminUsername.trim())
        newErrors.adminUsername = "Username is required";
      if (!formData.adminPassword.trim())
        newErrors.adminPassword = "Password is required";
      if (formData.adminPassword.length < 6)
        newErrors.adminPassword = "Password must be at least 6 characters";
    } else if (step === 1) {
      if (!formData.schoolName.trim())
        newErrors.schoolName = "School name is required";
      if (!formData.schoolAddress.trim())
        newErrors.schoolAddress = "Address is required";
      if (!formData.schoolEmail.trim())
        newErrors.schoolEmail = "School email is required";
      if (!formData.schoolPhone.some((phone) => phone.trim()))
        newErrors.schoolPhone = "At least one school phone is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    setAttemptedSubmit(true);
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      setAttemptedSubmit(false);
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
    setAttemptedSubmit(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);

    if (!validateStep(0) || !validateStep(1)) {
      showToast({
        title: "Validation Error",
        message: "Please fill out all required fields correctly.",
        type: "error",
      });
      // Find the first step with an error and go to it
      if (!validateStep(0)) setCurrentStep(0);
      else if (!validateStep(1)) setCurrentStep(1);
      return;
    }

    setSubmitting(true);

    try {
      // Filter out empty phone numbers before submitting
      const submitData = {
        ...formData,
        schoolPhone: formData.schoolPhone.filter((phone) => phone.trim()),
      };

      const result = await initializeSystem(submitData);
      if (result && result.superAdmin) {
        showToast({
          title: "Account Created",
          message: "Please check your email for a verification code.",
          type: "success",
        });
        router.push(`/verify-email?userId=${result.superAdmin.id}`);
      } else {
        throw new Error("Could not retrieve user ID after setup.");
      }
    } catch (error: unknown) {
      console.error("Error initializing system:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to initialize system";
      showToast({
        title: "Setup Failed",
        message: errorMessage,
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader fullScreen text="Checking System Status..." />;
  }

  const renderFormStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Admin Account Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="adminName"
                value={formData.adminName}
                onChange={handleInputChange}
                placeholder="Full Name"
                className={`input ${
                  attemptedSubmit && errors.adminName ? "input-error" : ""
                }`}
              />
              <input
                name="adminEmail"
                type="email"
                value={formData.adminEmail}
                onChange={handleInputChange}
                placeholder="Email Address"
                className={`input ${
                  attemptedSubmit && errors.adminEmail ? "input-error" : ""
                }`}
              />
              <input
                name="adminUsername"
                value={formData.adminUsername}
                onChange={handleInputChange}
                placeholder="Username"
                className={`input ${
                  attemptedSubmit && errors.adminUsername ? "input-error" : ""
                }`}
              />
              <input
                name="adminPassword"
                type="password"
                value={formData.adminPassword}
                onChange={handleInputChange}
                placeholder="Password"
                className={`input ${
                  attemptedSubmit && errors.adminPassword ? "input-error" : ""
                }`}
              />
            </div>
            {attemptedSubmit &&
              Object.values(errors).map((err) => (
                <p key={err} className="text-red-500 text-sm">
                  {err}
                </p>
              ))}
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              School Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="schoolName"
                value={formData.schoolName}
                onChange={handleInputChange}
                placeholder="School Name"
                className={`input ${
                  attemptedSubmit && errors.schoolName ? "input-error" : ""
                }`}
              />
              <input
                name="schoolAddress"
                value={formData.schoolAddress}
                onChange={handleInputChange}
                placeholder="School Address"
                className={`input ${
                  attemptedSubmit && errors.schoolAddress ? "input-error" : ""
                }`}
              />
              <input
                name="schoolEmail"
                type="email"
                value={formData.schoolEmail}
                onChange={handleInputChange}
                placeholder="School Email"
                className={`input ${
                  attemptedSubmit && errors.schoolEmail ? "input-error" : ""
                }`}
              />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  School Phone Numbers
                </label>
                {formData.schoolPhone.map((phone, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      name={`schoolPhone-${index}`}
                      value={phone}
                      onChange={handleInputChange}
                      placeholder={`School Phone ${index + 1}`}
                      className={`input flex-1 ${
                        attemptedSubmit && errors.schoolPhone
                          ? "input-error"
                          : ""
                      }`}
                    />
                    {formData.schoolPhone.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePhoneNumber(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addPhoneNumber}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add another phone number
                </button>
              </div>
            </div>
            {attemptedSubmit &&
              Object.values(errors).map((err) => (
                <p key={err} className="text-red-500 text-sm">
                  {err}
                </p>
              ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-2xl w-full">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to EduStack
          </h1>
          <p className="text-gray-600">
            Let&apos;s set up your school management system.
          </p>
        </header>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-500">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <motion.div
                className="bg-sky-500 h-2 rounded-full"
                animate={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
                transition={{ ease: "easeInOut", duration: 0.5 }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                {renderFormStep()}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="btn-secondary disabled:opacity-50"
              >
                Previous
              </button>

              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary disabled:opacity-50"
                >
                  {submitting ? <ButtonLoader /> : "Complete Setup"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
