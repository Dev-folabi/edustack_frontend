"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import { Loader } from "@/components/ui/Loader";
import { useAuthStore } from "@/store/authStore";
import type { OnboardingData } from "@/services/authService";

export default function OnboardingPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
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

  const sections = [
    {
      title: "Super Admin Account",
      icon: "👤",
      description: "Create the main administrator account",
      color: "from-blue-500/20 to-purple-500/20"
    },
    {
      title: "School Information",
      icon: "🏫",
      description: "Configure your school's details",
      color: "from-green-500/20 to-blue-500/20"
    }
  ];

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      const status = await checkOnboardingStatus();
      if (status.isOnboarded) {
        router.push('/admin/dashboard');
        return;
      }
    } catch (error) {
      console.error('Failed to check system status:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Super Admin validation
    if (!formData.adminName.trim()) newErrors.adminName = 'Name is required';
    if (!formData.adminEmail.trim()) newErrors.adminEmail = 'Email is required';
    if (!formData.adminUsername.trim()) newErrors.adminUsername = 'Username is required';
    if (!formData.adminPassword.trim()) newErrors.adminPassword = 'Password is required';
    if (formData.adminPassword.length < 6) newErrors.adminPassword = 'Password must be at least 6 characters';
    
    // School validation
    if (!formData.schoolName.trim()) newErrors.schoolName = 'School name is required';
    if (!formData.schoolAddress.trim()) newErrors.schoolAddress = 'Address is required';
    if (!formData.schoolEmail.trim()) newErrors.schoolEmail = 'School email is required';
    if (!formData.schoolPhone.trim()) newErrors.schoolPhone = 'School phone is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Please fix the errors before submitting', 'error');
      return;
    }
    
    setSubmitting(true);
    
    try {
      await initializeSystem(formData);
      showToast('System initialized successfully!', 'success');
      router.push('/admin/dashboard?onboarding=complete');
    } catch (error: any) {
      console.error('Error initializing system:', error);
      showToast(error.message || 'Failed to initialize system', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  const renderSuperAdminSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
          <span className="text-3xl">👤</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Super Admin Account</h3>
        <p className="text-white/70">Create the main administrator account</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">Full Name</label>
          <input
            type="text"
            name="adminName"
            value={formData.adminName}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all duration-300 ${
              errors.adminName ? 'border-red-400/50 ring-2 ring-red-400/50' : ''
            }`}
            placeholder="Enter your full name"
          />
          {errors.adminName && <p className="text-red-400 text-sm mt-1">{errors.adminName}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">Email Address</label>
          <input
            type="email"
            name="adminEmail"
            value={formData.adminEmail}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all duration-300 ${
              errors.adminEmail ? 'border-red-400/50 ring-2 ring-red-400/50' : ''
            }`}
            placeholder="admin@school.edu"
          />
          {errors.adminEmail && <p className="text-red-400 text-sm mt-1">{errors.adminEmail}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">Username</label>
          <input
            type="text"
            name="adminUsername"
            value={formData.adminUsername}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all duration-300 ${
              errors.adminUsername ? 'border-red-400/50 ring-2 ring-red-400/50' : ''
            }`}
            placeholder="admin"
          />
          {errors.adminUsername && <p className="text-red-400 text-sm mt-1">{errors.adminUsername}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">Password</label>
          <input
            type="password"
            name="adminPassword"
            value={formData.adminPassword}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all duration-300 ${
              errors.adminPassword ? 'border-red-400/50 ring-2 ring-red-400/50' : ''
            }`}
            placeholder="Minimum 6 characters"
          />
          {errors.adminPassword && <p className="text-red-400 text-sm mt-1">{errors.adminPassword}</p>}
        </div>
      </div>
    </motion.div>
  );

  const renderSchoolSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-blue-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
          <span className="text-3xl">🏫</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">School Information</h3>
        <p className="text-white/70">Configure your school's details</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">School Name</label>
          <input
            type="text"
            name="schoolName"
            value={formData.schoolName}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent transition-all duration-300 ${
              errors.schoolName ? 'border-red-400/50 ring-2 ring-red-400/50' : ''
            }`}
            placeholder="Enter your school name"
          />
          {errors.schoolName && <p className="text-red-400 text-sm mt-1">{errors.schoolName}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">School Address</label>
          <input
            type="text"
            name="schoolAddress"
            value={formData.schoolAddress}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent transition-all duration-300 ${
              errors.schoolAddress ? 'border-red-400/50 ring-2 ring-red-400/50' : ''
            }`}
            placeholder="Enter school address"
          />
          {errors.schoolAddress && <p className="text-red-400 text-sm mt-1">{errors.schoolAddress}</p>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">School Email</label>
            <input
              type="email"
              name="schoolEmail"
              value={formData.schoolEmail}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent transition-all duration-300 ${
                errors.schoolEmail ? 'border-red-400/50 ring-2 ring-red-400/50' : ''
              }`}
              placeholder="info@school.edu"
            />
            {errors.schoolEmail && <p className="text-red-400 text-sm mt-1">{errors.schoolEmail}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">School Phone</label>
            <input
              type="tel"
              name="schoolPhone"
              value={formData.schoolPhone}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent transition-all duration-300 ${
                errors.schoolPhone ? 'border-red-400/50 ring-2 ring-red-400/50' : ''
              }`}
              placeholder="+1 (555) 123-4567"
            />
            {errors.schoolPhone && <p className="text-red-400 text-sm mt-1">{errors.schoolPhone}</p>}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">School Website (Optional)</label>
          <input
            type="url"
            name="schoolWebsite"
            value={formData.schoolWebsite}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent transition-all duration-300"
            placeholder="https://www.school.edu"
          />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-4xl"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold text-white mb-4"
            >
              Welcome to EduStack
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-white/70 mb-8"
            >
              Let's set up your school management system
            </motion.p>
            
            {/* Progress Indicator */}
            <div className="flex justify-center space-x-4 mb-8">
              {sections.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full backdrop-blur-sm border transition-all duration-300 ${
                    currentSection === index
                      ? 'bg-white/20 border-white/40 text-white'
                      : 'bg-white/10 border-white/20 text-white/60'
                  }`}
                >
                  <span className="text-lg">{section.icon}</span>
                  <span className="text-sm font-medium hidden sm:block">{section.title}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl p-8 md:p-12"
          >
            <form onSubmit={handleSubmit} className="space-y-12">
              {/* Section Navigation */}
              <div className="flex justify-center space-x-2 mb-8">
                {sections.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentSection(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      currentSection === index
                        ? 'bg-white scale-125'
                        : 'bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>

              {/* Form Sections */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSection}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentSection === 0 && renderSuperAdminSection()}
                  {currentSection === 1 && renderSchoolSection()}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-8">
                <button
                  type="button"
                  onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                  disabled={currentSection === 0}
                  className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white font-medium hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {currentSection < sections.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl text-white font-medium hover:from-green-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Setting up...</span>
                      </>
                    ) : (
                      <span>Complete Setup</span>
                    )}
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}