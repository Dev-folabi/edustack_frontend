"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '../../components/ui/Toast';
import { ButtonLoader } from '../../components/ui/Loader';
import { authService } from '../../services/authService';
import Link from 'next/link';

const VerifyEmailContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const id = searchParams.get('userId');
    if (id) {
      setUserId(id);
    } else {
      // Handle case where userId is missing
      showToast({ type: 'error', title: 'Missing Information', message: 'User ID is missing from the URL.' });
      router.push('/login');
    }
  }, [searchParams, router, showToast]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || otp.length !== 6) {
      showToast({ type: 'error', title: 'Invalid OTP', message: 'Please enter a 6-digit OTP.' });
      return;
    }

    setIsVerifying(true);
    try {
      await authService.verifyEmail(userId, otp);
      showToast({ type: 'success', title: 'Email Verified', message: 'Your account has been successfully verified. Please log in.' });
      router.push('/login');
    } catch (error: any) {
      showToast({ type: 'error', title: 'Verification Failed', message: error.message || 'An unknown error occurred.' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (!userId) return;

    setIsResending(true);
    try {
      await authService.resendOTP(userId);
      showToast({ type: 'success', title: 'OTP Resent', message: 'A new OTP has been sent to your email address.' });
    } catch (error: any) {
      showToast({ type: 'error', title: 'Failed to Resend', message: error.message || 'An unknown error occurred.' });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We've sent a 6-digit code to your email address. Please enter it below.
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label htmlFor="otp" className="sr-only">OTP</label>
              <input
                id="otp"
                name="otp"
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="input text-center text-2xl tracking-[.5em]"
                placeholder="------"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full btn-primary disabled:opacity-50 flex items-center justify-center"
            >
              {isVerifying ? <ButtonLoader /> : 'Verify Account'}
            </button>
          </form>
        </div>

        <div className="text-center text-sm text-gray-600">
          <p>
            Didn't receive the code?{' '}
            <button onClick={handleResendOtp} disabled={isResending} className="font-medium text-sky-600 hover:text-sky-500 disabled:opacity-50">
              {isResending ? 'Resending...' : 'Resend OTP'}
            </button>
          </p>
          <p className="mt-2">
            <Link href="/login" className="font-medium text-sky-600 hover:text-sky-500">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// Wrap the component in Suspense because useSearchParams requires it.
const VerifyEmailPage: React.FC = () => (
  <Suspense fallback={<div className="min-h-screen" />}>
    <VerifyEmailContent />
  </Suspense>
);

export default VerifyEmailPage;
