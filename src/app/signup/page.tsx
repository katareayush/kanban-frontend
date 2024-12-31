"use client"
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ChevronLeft, HomeIcon } from 'lucide-react';

interface FormData {
  username: string;
  email: string;
  password: string;
}

interface SignupResponse {
  token: string;
  message?: string;
}

const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;
const apiUrl = environment === 'local' 
  ? `http://localhost:5000/api/auth` 
  : process.env.NEXT_PUBLIC_AUTH_URL;

const api = axios.create({
  baseURL: apiUrl,
  headers: { 
    'Content-Type': 'application/json'
  }
});

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [verificationSent, setVerificationSent] = useState<boolean>(false);
  const [emailStatus, setEmailStatus] = useState<'sending' | 'sent' | 'error' | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setEmailStatus('sending');

    try {
      // First attempt to create the account
      const { data } = await api.post<SignupResponse>('/signup', formData);
      
      setEmailStatus('sent');
      setVerificationSent(true);

    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.code === 'ERR_NETWORK') {
          setError('Cannot connect to the server. Please try again later.');
        } else if (err.response?.data?.message.includes('username')) {
          setError('This username is already taken. Please choose another username.');
        } else if (err.response?.data?.message.includes('email') || err.response?.data?.message === 'User already exists') {
          setError('An account with this email already exists. Please try logging in instead.');
        } else {
          setError(err.response?.data?.message || 'Failed to create account. Please try again.');
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
      setEmailStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    setError('');
    setEmailStatus('sending');
  
    try {
      const response = await api.get(`/verify-email?resend=true&email=${encodeURIComponent(formData.email)}`);
      
      if (response.data.success) {
        setEmailStatus('sent');
        setError('Verification email has been resent. Please check your inbox.');
      } else {
        throw new Error(response.data.message || 'Failed to resend verification email');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to resend verification email. Please try again.');
      } else {
        setError('Failed to resend verification email. Please try again.');
      }
      setEmailStatus('error');
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-300 w-[400px] font-mono">
          <div className="text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-[#75d22e]/20 flex items-center justify-center mx-auto">
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
            <h2 className="text-2xl font-bold">Check Your Email</h2>
            <p className="text-gray-600">
              We've sent a verification link to <span className="font-semibold">{formData.email}</span>
            </p>
            <p className="text-sm text-gray-500">
              Please check your inbox and spam folder. The email should arrive within a few minutes.
            </p>
            <div className="mt-4">
              <button
                onClick={handleResendVerification}
                disabled={loading}
                className="text-[#75d22e] hover:text-[#64b524] text-sm disabled:opacity-50"
              >
                {loading ? 'Resending...' : "Didn't receive the email? Click to resend"}
              </button>
            </div>

            <div className='mt-4'>
                <button onClick={()=>{router.push('/login')}} className="flex-1 px-4 py-2 bg-[#75d22e] text-white font-mono rounded-lg hover:bg-[#64b524]">
                    Continue to Login
                </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen relative">
      <button
        onClick={() => router.push('/')}
        className="absolute top-8 left-8 p-2 text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="Back to landing page"
      >
        <HomeIcon size={30} />
        
      </button>

      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-300 w-[400px] font-mono">
        <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">
            {error}
            {error.includes('already exists') && (
              <div className="mt-2 text-sm">
                <a href="/login" className="text-[#75d22e] hover:text-[#64b524]">
                  Click here to login →
                </a>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Username</label>
              <input
                type="text"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Password</label>
              <input
                type="password"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#75d22e] text-white p-2 rounded hover:bg-[#64b524] transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (emailStatus === 'sending' ? 'Sending Verification...' : 'Creating Account...') : 'Sign Up'}
            </button>

            <div className="space-y-4">
              Already have an account? <a href="/login" className="text-[#75d22e]">Login</a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};