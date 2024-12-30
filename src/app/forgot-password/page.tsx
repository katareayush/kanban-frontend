// ForgotPassword.tsx
"use client";
import { useState, FormEvent } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage(response.data.message);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen font-mono">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-300 w-[400px] m-4">
        <h1 className="text-2xl font-bold mb-6">Forgot Password</h1>
        
        {message && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
            <p className="text-green-700">{message}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#75d22e] focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-8 py-3 bg-[#75d22e] text-white font-bold rounded-full 
              hover:bg-[#64b524] transition-all
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {loading ? 'Sending...' : 'Reset Password'}
          </button>

          <div className="text-center">
            <a href="/login" className="text-sm text-[#75d22e] hover:underline">
              Back to Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;