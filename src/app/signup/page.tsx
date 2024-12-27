"use client"
import { useState, FormEvent } from 'react';
import axios from 'axios';

interface FormData {
  username: string;
  email: string;
  password: string;
}

interface SignupResponse {
  token: string;
  message?: string;
}

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

export default function Signup() {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post<SignupResponse>('http://localhost:5000/api/auth/signup', formData);
      localStorage.setItem('token', data.token);
      window.location.href = '/';
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data.message || 'Signup failed');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-300 w-[400px] font-mono">
        <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">
            {error}
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
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#75d22e] text-white p-2 rounded hover:bg-[#64b524] transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>

            <div className='space-y-4'>
                Already have an account? <a href='/login' className='text-[#75d22e]'>Login</a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}