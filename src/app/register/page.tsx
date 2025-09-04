'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { useToast } from '../../components/ui/Toast';
import { Loader, ButtonLoader } from '../../components/ui/Loader';
import Link from 'next/link';

type UserType = 'staff' | 'student';
type StaffRole = 'teacher' | 'accountant' | 'librarian';

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const { checkOnboardingStatus } = useAuthStore();
  const { showToast } = useToast();
  
  const [userType, setUserType] = useState<UserType>('student');
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schools, setSchools] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  
  // Staff form data
  const [staffData, setStaffData] = useState({
    email: '',
    password: '',
    username: '',
    name: '',
    phone: [''],
    address: '',
    schoolId: '',
    role: 'teacher' as StaffRole,
    designation: '',
    dob: '',
    salary: 0,
    joining_date: '',
    gender: 'male' as 'male' | 'female',
    qualification: '',
    notes: '',
  });
  
  // Student form data
  const [studentData, setStudentData] = useState({
    email: '',
    password: '',
    username: '',
    schoolId: '',
    classId: '',
    sectionId: '',
    name: '',
    gender: 'male' as 'male' | 'female',
    dob: '',
    phone: '',
    address: '',
    admission_date: '',
    religion: '',
    blood_group: '',
    father_name: '',
    mother_name: '',
    father_occupation: '',
    mother_occupation: '',
    city: '',
    state: '',
    country: '',
    exist_guardian: false,
    guardian_name: '',
    guardian_phone: [''],
    guardian_email: '',
    guardian_username: '',
    guardian_password: '',
  });

  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const isOnboarded = await checkOnboardingStatus();
        if (!isOnboarded) {
          router.push('/onboarding');
          return;
        }
        // Load schools
        await loadSchools();
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setIsCheckingOnboarding(false);
      }
    };

    checkSystemStatus();
  }, [checkOnboardingStatus, router]);

  const loadSchools = async () => {
    try {
      const response = await authService.getSchools();
      if (response.success) {
        setSchools(response.data);
      }
    } catch (error) {
      console.error('Error loading schools:', error);
    }
  };

  const loadClasses = async (schoolId: string) => {
    try {
      const response = await authService.getClasses(schoolId);
      if (response.success) {
        setClasses(response.data);
        setSections([]); // Reset sections
      }
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const loadSections = async (classId: string) => {
    try {
      const response = await authService.getSections(classId);
      if (response.success) {
        setSections(response.data);
      }
    } catch (error) {
      console.error('Error loading sections:', error);
    }
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await authService.staffSignup({
        ...staffData,
        isActive: true,
      });
      
      if (response.success) {
        showToast({
          type: 'success',
          title: 'Registration Successful',
          message: 'Staff account created successfully!',
        });
        router.push('/login');
      }
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Registration Failed',
        message: error.message || 'Failed to create staff account',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await authService.studentSignup({
        ...studentData,
        isActive: true,
      });
      
      if (response.success) {
        showToast({
          type: 'success',
          title: 'Registration Successful',
          message: 'Student account created successfully!',
        });
        router.push('/login');
      }
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Registration Failed',
        message: error.message || 'Failed to create student account',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingOnboarding) {
    return <Loader fullScreen text="Checking system status..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Join EduStack</h1>
          <p className="text-white/70">Create your account to get started</p>
        </motion.div>

        {/* User Type Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-2 flex">
            <button
              onClick={() => setUserType('student')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                userType === 'student'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => setUserType('staff')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                userType === 'staff'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Staff
            </button>
          </div>
        </motion.div>

        {/* Registration Forms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl"
        >
          <AnimatePresence mode="wait">
            {userType === 'staff' ? (
              <motion.form
                key="staff"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleStaffSubmit}
                className="space-y-6"
              >
                {/* Staff form fields would go here - similar structure to login */}
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-6">Staff Registration</h2>
                </div>
                
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={staffData.name}
                      onChange={(e) => setStaffData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
                    <input
                      type="email"
                      value={staffData.email}
                      onChange={(e) => setStaffData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>
                
                {/* Continue with other staff fields... */}
                
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <ButtonLoader />
                      <span className="ml-2">Creating Account...</span>
                    </>
                  ) : (
                    'Create Staff Account'
                  )}
                </motion.button>
              </motion.form>
            ) : (
              <motion.form
                key="student"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleStudentSubmit}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-6">Student Registration</h2>
                </div>
                
                {/* Student form fields would go here - similar structure */}
                
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <ButtonLoader />
                      <span className="ml-2">Creating Account...</span>
                    </>
                  ) : (
                    'Create Student Account'
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-6">
          <Link
            href="/login"
            className="text-white/70 hover:text-white transition-colors"
          >
            Already have an account? Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;