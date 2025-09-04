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
  const [formData, setFormData] = useState<OnboardingData>({
    adminName: "",
    adminEmail: "",
    adminUsername: "",
    adminPassword: "",
    schoolName: "",
    schoolAddress: "",
    schoolPhone: "",
    schoolEmail: "",
    schoolWebsite: "",
    appName: "EduStack Academy",
    allowRegistration: true,
    sessionTimeout: 30,
    maxFileSize: 10,
    enableEmailNotifications: true
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
          router.push('/login');
          return;
        }
      } catch (error) {
        console.error('Failed to check system status:', error);
      } finally {
        setLoading(false);
      }
    };
    checkSystemStatus();
  }, [checkOnboardingStatus, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 0) {
      if (!formData.adminName.trim()) newErrors.adminName = 'Name is required';
      if (!formData.adminEmail.trim()) newErrors.adminEmail = 'Email is required';
      if (!formData.adminUsername.trim()) newErrors.adminUsername = 'Username is required';
      if (!formData.adminPassword.trim()) newErrors.adminPassword = 'Password is required';
      if (formData.adminPassword.length < 6) newErrors.adminPassword = 'Password must be at least 6 characters';
    } else if (step === 1) {
      if (!formData.schoolName.trim()) newErrors.schoolName = 'School name is required';
      if (!formData.schoolAddress.trim()) newErrors.schoolAddress = 'Address is required';
      if (!formData.schoolEmail.trim()) newErrors.schoolEmail = 'School email is required';
      if (!formData.schoolPhone.trim()) newErrors.schoolPhone = 'School phone is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(0) || !validateStep(1)) {
      showToast({ title: "Validation Error", message: "Please fill out all required fields correctly.", type: "error" });
      // Find the first step with an error and go to it
      if(!validateStep(0)) setCurrentStep(0);
      else if(!validateStep(1)) setCurrentStep(1);
      return;
    }
    
    setSubmitting(true);
    
    try {
      const result = await initializeSystem(formData);
      if (result && result.superAdmin) {
        showToast({ title: "Account Created", message: "Please check your email for a verification code.", type: "success" });
        router.push(`/verify-email?userId=${result.superAdmin.id}`);
      } else {
        throw new Error("Could not retrieve user ID after setup.");
      }
    } catch (error: any) {
      console.error('Error initializing system:', error);
      showToast({ title: "Setup Failed", message: error.message || 'Failed to initialize system', type: "error" });
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
            <h3 className="text-lg font-medium text-gray-900">Admin Account Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="adminName" value={formData.adminName} onChange={handleInputChange} placeholder="Full Name" className={`input ${errors.adminName ? 'input-error' : ''}`} />
              <input name="adminEmail" type="email" value={formData.adminEmail} onChange={handleInputChange} placeholder="Email Address" className={`input ${errors.adminEmail ? 'input-error' : ''}`} />
              <input name="adminUsername" value={formData.adminUsername} onChange={handleInputChange} placeholder="Username" className={`input ${errors.adminUsername ? 'input-error' : ''}`} />
              <input name="adminPassword" type="password" value={formData.adminPassword} onChange={handleInputChange} placeholder="Password" className={`input ${errors.adminPassword ? 'input-error' : ''}`} />
            </div>
            {Object.values(errors).map(err => <p key={err} className="text-red-500 text-sm">{err}</p>)}
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">School Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="schoolName" value={formData.schoolName} onChange={handleInputChange} placeholder="School Name" className={`input ${errors.schoolName ? 'input-error' : ''}`} />
              <input name="schoolAddress" value={formData.schoolAddress} onChange={handleInputChange} placeholder="School Address" className={`input ${errors.schoolAddress ? 'input-error' : ''}`} />
              <input name="schoolEmail" type="email" value={formData.schoolEmail} onChange={handleInputChange} placeholder="School Email" className={`input ${errors.schoolEmail ? 'input-error' : ''}`} />
              <input name="schoolPhone" value={formData.schoolPhone} onChange={handleInputChange} placeholder="School Phone" className={`input ${errors.schoolPhone ? 'input-error' : ''}`} />
              <input name="schoolWebsite" value={formData.schoolWebsite} onChange={handleInputChange} placeholder="School Website (Optional)" className="input col-span-1 md:col-span-2" />
            </div>
             {Object.values(errors).map(err => <p key={err} className="text-red-500 text-sm">{err}</p>)}
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
          <h1 className="text-3xl font-bold text-gray-900">Welcome to EduStack</h1>
          <p className="text-gray-600">Let's set up your school management system.</p>
        </header>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-500">Step {currentStep + 1} of {steps.length}: {steps[currentStep]}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <motion.div
                className="bg-sky-500 h-2 rounded-full"
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
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
              <button type="button" onClick={handlePrev} disabled={currentStep === 0} className="btn-secondary disabled:opacity-50">
                Previous
              </button>

              {currentStep < steps.length - 1 ? (
                <button type="button" onClick={handleNext} className="btn-primary">
                  Next
                </button>
              ) : (
                <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
                  {submitting ? <ButtonLoader /> : 'Complete Setup'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}