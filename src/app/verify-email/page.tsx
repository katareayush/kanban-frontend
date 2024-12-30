"use client"
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Verification token is missing');
        return;
      }

      try {
        const { data } = await api.get(`http://localhost:5000/api/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } catch (err) {
        setStatus('error');
        if (axios.isAxiosError(err)) {
          setMessage(err.response?.data.message || 'Verification failed');
        } else {
          setMessage('An unexpected error occurred');
        }
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#75d22e]" />
        );
      case 'success':
        return (
          <div className="h-12 w-12 rounded-full bg-[#75d22e]/20 flex items-center justify-center">
            <svg
              className="h-6 w-6 text-[#75d22e]"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="h-6 w-6 text-red-500"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-300 w-[400px] font-mono">
        <div className="flex flex-col items-center space-y-4">
          {getStatusIcon()}
          
          <h1 className="text-2xl font-bold">
            {status === 'loading' ? 'Verifying Email' : 'Email Verification'}
          </h1>
          
          <p className={`text-center ${
            status === 'error' ? 'text-red-500' : 
            status === 'success' ? 'text-[#75d22e]' : 
            'text-gray-600'
          }`}>
            {message || 'Please wait while we verify your email...'}
          </p>

          {status === 'success' && (
            <p className="text-sm text-gray-500">
              Redirecting to your Login...
            </p>
          )}

          {status === 'error' && (
            <a 
              href="/login" 
              className="text-[#75d22e] hover:text-[#64b524] transition-colors mt-4"
            >
              Back to Login
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-300 w-[400px] font-mono">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#75d22e]" />
          <h1 className="text-2xl font-bold">Loading...</h1>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}